const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // progreso de actualización
  onUpdateProgress: (callback) =>
    ipcRenderer.on("update-progress", (_, percent) => callback(percent)),
});
