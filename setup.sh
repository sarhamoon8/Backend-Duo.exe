#!/bin/sh
# Levanta el stack completo de FilaCero (base de datos + backend + frontend).
# Si el repo del frontend no esta clonado al lado de este, lo clona solo.
# Uso: ./setup.sh   (desde la raiz de este repo)
set -e

FRONTEND_PATH="${FRONTEND_PATH:-../Fronted-Duo.exe}"
FRONTEND_URL="https://github.com/sarhamoon8/Fronted-Duo.exe.git"
FRONTEND_BRANCH="${FRONTEND_BRANCH:-desarrollo}"

if [ ! -f "$FRONTEND_PATH/package.json" ]; then
  echo "No se encontro el frontend en '$FRONTEND_PATH'. Clonando rama '$FRONTEND_BRANCH' desde GitHub..."
  git clone --branch "$FRONTEND_BRANCH" "$FRONTEND_URL" "$FRONTEND_PATH"
else
  echo "Frontend encontrado en '$FRONTEND_PATH'."
fi

docker compose up --build
