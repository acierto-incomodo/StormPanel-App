#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Limpiando dist/"
rm -rf dist

echo "[2/4] Instalando dependencias"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "[3/4] Construyendo .AppImage y .deb"
npx electron-builder --linux AppImage deb

echo "[4/4] Publicando release para updater (latest-linux.yml)"
npx electron-builder --linux AppImage deb --publish always

echo "Listo. Revisa dist/latest-linux.yml y los artefactos .AppImage/.deb en dist/"
