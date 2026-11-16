const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getServiceLinks: () => ipcRenderer.invoke("get-service-links"),
  saveServiceLinks: (links) => ipcRenderer.invoke("save-service-links", links),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),

  // progreso de actualización
  onUpdateProgress: (callback) =>
    ipcRenderer.on("update-progress", (_, percent) => callback(percent)),
});
