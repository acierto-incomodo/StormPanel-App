#!/usr/bin/env bash
echo "[1/4] Eliminando artefactos de Linux anteriores"
# Eliminar artefactos de Linux anteriores
rm -f latest-linux.yml *.deb *.AppImage

echo "[2/4] Preparando dependencias"
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[3/4] Instalando dependencias"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "[4/4] Construyendo .AppImage y .deb"
npx electron-builder --linux AppImage deb

echo "Listo. Revisa dist/latest-linux.yml y los artefactos .AppImage/.deb en dist/"
