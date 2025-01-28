const { app, BrowserWindow, dialog, ipcMain, Menu, shell } = require("electron");
const { autoUpdater } = require("electron-updater");

let mainWindow;

// Función para configurar el menú
function configurarMenu() {
    const menuTemplate = [
        {
            label: "Inicio",
            click: () => {
                mainWindow.loadFile('index.html'); // Cargar index.html al hacer clic en "Inicio"
            }
        },
        {
            label: "Páginas",
            submenu: [
                {
                    label: "Panel",
                    click: () => {
                        mainWindow.loadURL("http://stormpanel.mooo.com:23333"); // Cargar URL del panel
                    }
                },
                {
                    label: "Status",
                    click: () => {
                        mainWindow.loadURL("https://stats.uptimerobot.com/Kj5fTWCONH"); // Cargar URL del status
                    }
                }
            ]
        },
        {
            label: "Ayuda",
            submenu: [
                {
                    label: "Documentación",
                    click: () => {
                        mainWindow.loadFile('404.html'); // Abrir la documentación en el navegador
                    }
                },
                {
                    label: "Soporte",
                    click: () => {
                        mainWindow.loadFile('404.html'); // Abrir soporte en el navegador
                    }
                },
                {
                    label: "Acerca de",
                    click: () => {
                        mainWindow.loadFile('404.html'); // Cargar about.html al hacer clic en "Acerca de"
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu); // Establecer el menú como el menú de la aplicación
}

app.on("ready", () => {
    // Crear la ventana principal
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { 
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile("index.html"); // Cargar index.html al iniciar

    // Configurar el menú
    configurarMenu();

    // Comprobar actualizaciones al iniciar
    autoUpdater.checkForUpdatesAndNotify();

    // Eventos del autoUpdater
    autoUpdater.on("update-available", () => {
        dialog.showMessageBox({
            type: "info",
            title: "Actualización Disponible",
            message: "Hay una nueva versión disponible. Se descargará en segundo plano."
        });
    });

    autoUpdater.on("update-downloaded", () => {
        dialog.showMessageBox({
            type: "info",
            title: "Actualización Lista",
            message: "La actualización se descargó. ¿Quieres reiniciar para aplicar la actualización?",
            buttons: ["Reiniciar", "Más tarde"]
        }).then(result => {
            if (result.response === 0) autoUpdater.quitAndInstall();
        });
    });

    autoUpdater.on("error", (error) => {
        console.error("Error en la actualización:", error);
    });
});

// Manejar solicitud de versión
ipcMain.handle("get-app-version", () => {
    return app.getVersion();
});
