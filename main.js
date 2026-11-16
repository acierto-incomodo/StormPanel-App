const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  session,
  shell,
  Notification,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs").promises;

let mainWindow;
const defaultServiceLinks = {
  stormPanel: "http://myjoncraft.mooo.com:23333",
  webmin: "https://myjoncraft.mooo.com:10000",
  status: "https://stats.uptimerobot.com/Kj5fTWCONH",
};
let serviceLinks = { ...defaultServiceLinks };
const gotTheLock = app.requestSingleInstanceLock();

function validateServiceLinks(links) {
  const validatedLinks = {};

  for (const key of Object.keys(defaultServiceLinks)) {
    if (typeof links?.[key] !== "string") {
      throw new Error(`El enlace "${key}" no es válido.`);
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(links[key]);
    } catch {
      throw new Error(`El enlace "${key}" no es una URL válida.`);
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error(`El enlace "${key}" debe usar HTTP o HTTPS.`);
    }

    validatedLinks[key] = parsedUrl.href;
  }

  return validatedLinks;
}

async function cargarEnlacesServicio() {
  const settingsPath = path.join(app.getPath("userData"), "service-links.json");
  try {
    const savedSettings = await fs.readFile(settingsPath, "utf8");
    serviceLinks = validateServiceLinks(JSON.parse(savedSettings));
  } catch (error) {
    if (error.code === "ENOENT") return;
    console.error("No se pudieron cargar los enlaces configurados:", error);
  }
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ⚙️ CONFIGURACIÓN DEL AUTO-UPDATER
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowDowngrade = true;

// 🔔 notificaciones
function mostrarNotificacion(titulo, mensaje) {
  if (Notification.isSupported()) {
    new Notification({
      title: titulo,
      body: mensaje,
      icon: path.join(__dirname, "icon.png"),
    }).show();
  }
}

// Método para comprobar actualizaciones manualmente
function comprobarActualizaciones() {
  autoUpdater.checkForUpdates().catch((err) => {
    console.error("Error comprobando actualizaciones:", err);
  });
}

// Función para configurar el menú
function configurarMenu() {
  const menuTemplate = [
    {
      label: "Inicio",
      click: () => mainWindow.loadFile("index.html"),
    },
    {
      label: "Páginas",
      submenu: [
        {
          label: "StormPanel Online",
          click: () => mainWindow.loadURL(serviceLinks.stormPanel),
        },
        {
          label: "Webmin Online",
          click: () => mainWindow.loadURL(serviceLinks.webmin),
        },
        {
          label: "Status",
          click: () => {
            session.defaultSession.clearCache().then(() => {
              mainWindow.loadURL(serviceLinks.status);
            });
          },
        },
        {
          label: "Configuración",
          click: () => mainWindow.loadFile("configuracion.html"),
        },
        { label: "Versión", click: () => mainWindow.loadFile("version.html") },
        {
          label: "MyJonCraft SGS Web",
          click: () =>
            mainWindow.loadURL("https://myjoncraft-sgs-web.vercel.app"),
        },
        {
          label: "StormGamesStudios",
          click: () =>
            mainWindow.loadURL("https://stormgamesstudios.vercel.app"),
        },
      ],
    },
    {
      label: "Ayuda",
      submenu: [
        { label: "Soporte", click: () => mainWindow.loadFile("soporte.html") },
        { label: "Acerca de", click: () => mainWindow.loadFile("acerca.html") },
        {
          label: "Documentación",
          click: () => mainWindow.loadFile("documentacion.html"),
        },
        {
          label: "Error de Actualización",
          click: () => mainWindow.loadFile("error_actualizacion.html"),
        },
        {
          label: "Comprobar Actualizaciones",
          click: () => mainWindow.loadFile("update.html"),
        },
      ],
    },
    {
      label: "Extras",
      submenu: [
        {
          label: "Mostrar Consola",
          accelerator: "F12",
          click: () => mainWindow.webContents.openDevTools(),
        },
        {
          label: "Recargar Página",
          accelerator: "F5",
          click: () => mainWindow.reload(),
        },
        {
          label: "Recargar (Forzoso)",
          accelerator: "Ctrl+F5",
          click: () => mainWindow.webContents.reloadIgnoringCache(),
        },
        {
          label: "Cerrar Aplicación",
          accelerator: "Alt+F4",
          click: () => app.quit(),
        },
        {
          label: "Reiniciar Aplicación",
          click: () => {
            app.relaunch();
            app.quit();
          },
        },
        {
          label: "Comprobar Actualizaciones",
          click: () => comprobarActualizaciones(),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

if (gotTheLock) {
  app.whenReady().then(async () => {
    await cargarEnlacesServicio();
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
        enableRemoteModule: false,
      },
    });

    mainWindow.loadFile("index.html");
    mainWindow.maximize();
    mainWindow.setIcon(path.join(__dirname, "icon.png"));

    const contextMenu = Menu.buildFromTemplate([
      { label: "Copiar", role: "copy" },
      { label: "Pegar", role: "paste" },
      { type: "separator" },
      { label: "Recargar", click: () => mainWindow.reload() },
      {
        label: "Recargar (Forzoso)",
        click: () => mainWindow.webContents.reloadIgnoringCache(),
      },
      { type: "separator" },
      {
        label: "Abrir DevTools",
        click: () => mainWindow.webContents.openDevTools(),
      },
    ]);

    mainWindow.webContents.on("context-menu", (event, params) => {
      contextMenu.popup(mainWindow, params.x, params.y);
    });

    configurarMenu();

    // 🔄 Buscar actualizaciones al iniciar
    autoUpdater.checkForUpdates();
  });
}

// 📥 actualización disponible
autoUpdater.on("update-available", (info) => {
  console.log("Actualización disponible:", info.version);
  mostrarNotificacion("Actualización disponible", "Descargando actualización...");
});

// 📊 progreso de descarga
autoUpdater.on("download-progress", (progress) => {
  const percent = Math.round(progress.percent);

  console.log(`Descargando: ${percent}%`);

  if (mainWindow) {
    mainWindow.setProgressBar(progress.percent / 100);
    mainWindow.webContents.send("update-progress", percent);
  }
});

// ✅ descarga completada
autoUpdater.on("update-downloaded", () => {
  console.log("Actualización descargada. Instalando...");

  if (mainWindow) mainWindow.setProgressBar(-1);

  mostrarNotificacion("Actualización lista", "Instalando actualización...");

  setTimeout(() => {
    autoUpdater.quitAndInstall(false, true);
  }, 1200);
});

// ❌ error
autoUpdater.on("error", (err) => {
  console.error("Error en el autoUpdater:", err);
});

ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("get-service-links", () => ({ ...serviceLinks }));
ipcMain.handle("save-service-links", async (_, links) => {
  try {
    const validatedLinks = validateServiceLinks(links);
    const settingsPath = path.join(app.getPath("userData"), "service-links.json");
    await fs.writeFile(settingsPath, JSON.stringify(validatedLinks, null, 2), "utf8");
    serviceLinks = validatedLinks;
    return { ok: true };
  } catch (error) {
    console.error("Error al guardar los enlaces configurados:", error);
    return { ok: false, error: error.message };
  }
});
ipcMain.handle("check-for-updates", async () => {
  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (error) {
    console.error("Error al comprobar actualizaciones:", error);
    return { ok: false, error: String(error) };
  }
});
