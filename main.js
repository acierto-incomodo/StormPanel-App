const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  session,
  shell,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;

// ⚙️ CONFIGURACIÓN DEL AUTO-UPDATER
autoUpdater.autoDownload = true; // descargar automáticamente
autoUpdater.autoInstallOnAppQuit = true; // instalar al cerrar

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

  // Menú contextual
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

// 📥 Cuando hay actualización disponible
autoUpdater.on("update-available", (info) => {
  console.log("Actualización disponible:", info.version);
});

// 📦 Progreso de descarga (opcional)
autoUpdater.on("download-progress", (progress) => {
  console.log(`Descargando: ${Math.round(progress.percent)}%`);
});

// ✅ Cuando termina la descarga → instalar automáticamente
autoUpdater.on("update-downloaded", () => {
  console.log("Actualización descargada. Instalando...");
  setTimeout(() => {
    autoUpdater.quitAndInstall(false, true);
  }, 1000);
});

// ❌ Error
autoUpdater.on("error", (err) => {
  console.error("Error en el autoUpdater:", err);
});

ipcMain.handle("get-app-version", () => app.getVersion());
