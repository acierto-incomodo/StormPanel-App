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

const checkUpdatesBtn = document.getElementById("check-updates-btn");
const checkUpdatesStatus = document.getElementById("check-updates-status");

if (checkUpdatesBtn && window.electronAPI?.checkForUpdates) {
  checkUpdatesBtn.addEventListener("click", async () => {
    checkUpdatesBtn.disabled = true;

    if (checkUpdatesStatus) {
      checkUpdatesStatus.textContent = "Comprobando actualizaciones...";
    }

    const result = await window.electronAPI.checkForUpdates();

    if (checkUpdatesStatus) {
      checkUpdatesStatus.textContent = result?.ok
        ? "Comprobación iniciada. Si hay update, se descargará automáticamente."
        : "No se pudo comprobar actualizaciones. Revisa la consola.";
    }

    checkUpdatesBtn.disabled = false;
  });
}


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
