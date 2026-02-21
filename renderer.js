window.electronAPI
  .getAppVersion()
  .then((version) => {
    document.getElementById("app-version").textContent = version;
  })
  .catch((err) => {
    console.error("Error al obtener la versión:", err);
  });
window.electronAPI
  .getAppVersion()
  .then((version) => {
    document.getElementById("app-version-dos").textContent = version;
  })
  .catch((err) => {
    console.error("Error al obtener la versión:", err);
  });
