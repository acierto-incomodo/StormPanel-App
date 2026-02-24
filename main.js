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

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();

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
          click: () => mainWindow.loadURL("http://myjoncraft.mooo.com:23333"),
        },
        {
          label: "Status",
          click: () => {
            session.defaultSession.clearCache().then(() => {
              mainWindow.loadURL("https://stats.uptimerobot.com/Kj5fTWCONH");
            });
          },
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
  app.whenReady().then(() => {
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
ipcMain.handle("check-for-updates", async () => {
  try {
    await autoUpdater.checkForUpdates();
    return { ok: true };
  } catch (error) {
    console.error("Error al comprobar actualizaciones:", error);
    return { ok: false, error: String(error) };
  }
});
