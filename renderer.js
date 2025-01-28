const { ipcRenderer } = require("electron");

ipcRenderer.invoke("get-app-version").then((version) => {
  document.getElementById("app-version").textContent = version;
}).catch(err => {
  console.error("Error al obtener la versión:", err);
});
