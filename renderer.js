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


// 📊 barra de progreso de actualización
window.electronAPI.onUpdateProgress((percent) => {
  const container = document.getElementById("updateBarContainer");
  const bar = document.getElementById("updateBar");

  if (!container || !bar) return;

  container.style.display = "block";
  bar.style.width = percent + "%";

  if (percent >= 100) {
    setTimeout(() => {
      container.style.display = "none";
    }, 1500);
  }
});