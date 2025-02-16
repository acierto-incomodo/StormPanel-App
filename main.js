const { app, BrowserWindow, dialog, ipcMain, Menu, session } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

// Método para comprobar actualizaciones
function comprobarActualizaciones() {
    autoUpdater.checkForUpdates()
        .then((info) => {
            // Si no hay actualizaciones disponibles
            if (info.updateInfo && !info.updateInfo.version) {
                dialog.showMessageBox({
                    type: 'info',
                    title: 'No hay actualizaciones',
                    message: 'No hay actualizaciones disponibles en este momento.',
                    buttons: ['Aceptar']
                });
            }
        })
        .catch((err) => {
            // Si ocurre un error al comprobar las actualizaciones
            dialog.showErrorBox('Error al comprobar actualizaciones', 'Hubo un error al comprobar si hay actualizaciones: ' + err.message);
        });
}

let mainWindow;

// Función para configurar el menú
function configurarMenu() {
    const { app, BrowserWindow } = require("electron");

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
                    label: "StormPanel Online",
                    click: () => {
                        mainWindow.loadURL("http://67.218.236.213:23333"); // Cargar URL del panel
                    }
                },
                {
                    label: "Status",
                    click: () => {
                        session.defaultSession.clearCache().then(() => {
                            mainWindow.loadURL("https://stats.uptimerobot.com/Kj5fTWCONH");
                        });
                    }
                },
                {
                    label: "Versión",
                    click: () => {
                        mainWindow.loadFile('version.html'); // Cargar versión.html al hacer clic en "Versión"
                    }
                }
            ]
        },
        {
            label: "Ayuda",
            submenu: [
                {
                    label: "Soporte",
                    click: () => {
                        mainWindow.loadFile('soporte.html'); // Abrir soporte en el navegador
                    }
                },
                {
                    label: "Acerca de",
                    click: () => {
                        mainWindow.loadFile('acerca.html'); // Cargar about.html al hacer clic en "Acerca de"
                    }
                }
            ]
        },
        {
            label: "Extras",
            submenu: [
                {
                    label: "Mostrar Consola",
                    accelerator: "F12",
                    click: () => {
                        mainWindow.webContents.openDevTools(); // Abrir herramientas de desarrollo
                    }
                },
                {
                    label: "Recargar Página",
                    accelerator: "F5",
                    click: () => {
                        mainWindow.reload(); // Recargar la página
                    }
                },
                {
                    label: "Recargar (Forzoso)",
                    accelerator: "Ctrl+F5",
                    click: () => {
                        mainWindow.webContents.reloadIgnoringCache(); // Recargar sin caché
                    }
                },
                {
                    label: "Cerrar Aplicación",
                    accelerator: "Alt+F4",
                    click: () => {
                        app.quit(); // Cerrar la aplicación
                    }
                },
                {
                    label: "Reiniciar Aplicación",
                    click: () => {
                        app.relaunch(); // Reiniciar la aplicación
                        app.quit();
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
        minWidth: 800,
        minHeight: 600,
        webPreferences: { 
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js"),
            enableRemoteModule: false
        }
    });

    mainWindow.loadFile("index.html"); // Cargar index.html al iniciar
    mainWindow.maximize(); // Maximizar la ventana

    // Crear menú contextual
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Copiar",
            role: "copy"
        },
        {
            label: "Pegar",
            role: "paste"
        },
        { type: "separator" },
        {
            label: "Recargar",
            click: () => {
                mainWindow.reload();
            }
        },
        {
            label: "Recargar (Forzoso)",
            click: () => {
                mainWindow.webContents.reloadIgnoringCache(); // Recargar sin caché
            }
        },
        { type: "separator" },
        {
            label: "Abrir DevTools",
            click: () => {
                mainWindow.webContents.openDevTools();
            }
        }
    ]);

    // Detectar click derecho y mostrar el menú
    mainWindow.webContents.on("context-menu", (event, params) => {
        contextMenu.popup(mainWindow, params.x, params.y);
    });

    // Configurar el menú
    configurarMenu();

    // Comprobar actualizaciones al iniciar
    autoUpdater.checkForUpdatesAndNotify();

    // Eventos del autoUpdater
    autoUpdater.on("update-available", () => {
        dialog.showMessageBox({
            type: "info",
            title: "Actualización Disponible",
            message: "Hay una nueva versión disponible. Se descargará en segundo plano. Si no se descarga la versión visite https://github.com/acierto-incomodo/StormPanel-App/releases/download/v1.0.0/StormPanel-App-Setup-1.0.0.exe y descarge e instale el archivo."
        });
    });

    autoUpdater.on("update-downloaded", () => {
        dialog.showMessageBox({
            type: "info",
            title: "Actualización Lista",
            message: "La actualización se descargó. ¿Quieres reiniciar para aplicar la actualización?",
            buttons: ["Reiniciar"]
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

// Función para verificar si la URL está accesible
function checkAndLoadURL(window, url, fallback) {
    http.get(url, (res) => {
        if (res.statusCode === 200) {
            window.loadURL(url); // Si la URL es accesible, cargarla
        } else {
            window.loadFile(fallback); // Si no, cargar la página 404.html
        }
    }).on('error', (err) => {
        window.loadFile(fallback); // Si ocurre un error, cargar 404.html
    });
}