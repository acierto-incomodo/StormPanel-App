if (window.electronAPI?.getAppVersion) {
  window.electronAPI
    .getAppVersion()
    .then((version) => {
      ["app-version", "app-version-dos"].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.textContent = version;
      });
    })
    .catch((err) => {
      console.error("Error al obtener la versión:", err);
    });
} else {
  ["app-version", "app-version-dos"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = "Solo en la app de escritorio";
  });
}

const checkUpdatesBtn = document.getElementById("check-updates-btn");
const checkUpdatesStatus = document.getElementById("check-updates-status");

if (checkUpdatesBtn && window.electronAPI?.checkForUpdates) {
  checkUpdatesBtn.addEventListener("click", async () => {
    checkUpdatesBtn.disabled = true;

    if (checkUpdatesStatus) {
      checkUpdatesStatus.dataset.state = "loading";
      checkUpdatesStatus.textContent = "Comprobando actualizaciones...";
    }

    try {
      const result = await window.electronAPI.checkForUpdates();

      if (checkUpdatesStatus) {
        checkUpdatesStatus.dataset.state = result?.ok ? "success" : "error";
        checkUpdatesStatus.textContent = result?.ok
          ? "Comprobación iniciada. Si hay una actualización, se descargará automáticamente."
          : "No se pudieron comprobar las actualizaciones. Revisa la consola para más información.";
      }

      if (!result?.ok) {
        console.error("No se pudieron comprobar las actualizaciones:", result?.error);
      }
    } catch (err) {
      console.error("Error al comprobar las actualizaciones:", err);
      if (checkUpdatesStatus) {
        checkUpdatesStatus.dataset.state = "error";
        checkUpdatesStatus.textContent =
          "No se pudieron comprobar las actualizaciones. Revisa la consola para más información.";
      }
    } finally {
      checkUpdatesBtn.disabled = false;
    }
  });
} else if (checkUpdatesBtn && checkUpdatesStatus) {
  checkUpdatesBtn.disabled = true;
  checkUpdatesStatus.textContent = "Disponible en la app de escritorio.";
}

if (window.electronAPI?.onUpdateProgress) {
  window.electronAPI.onUpdateProgress((percent) => {
    const container = document.getElementById("updateBarContainer");
    const bar = document.getElementById("updateBar");

    if (!container || !bar) return;

    const progress = Math.max(0, Math.min(100, Math.round(percent)));
    container.hidden = false;
    container.setAttribute("aria-valuenow", String(progress));
    bar.style.width = `${progress}%`;

    if (progress >= 100) {
      setTimeout(() => {
        container.hidden = true;
      }, 1500);
    }
  });
}
