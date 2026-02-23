#!/bin/bash

# megamercado-dev-all.sh
# 0. Asegurar que estamos en la raíz del monorepo
cd "$(dirname "$0")/.."

echo "------------------------------------------"
echo "🚀 INICIANDO ENTORNO MEGAMERCADO (TODO-EN-UNO)"
echo "------------------------------------------"

# 1. Limpiar base de datos
echo "🧹 1. Limpiando base de datos MongoDB..."
yarn clean-db:force

# Función para abrir una nueva pestaña de terminal y ejecutar un comando
open_tab() {
  local title=$1
  local cmd=$2
  local dir=$(pwd)
  
  # Usamos una sintaxis de osascript más limpia para evitar errores de escape
  osascript <<EOF
    tell application "Terminal"
      activate
      tell application "System Events" to keystroke "t" using command down
      delay 0.5
      do script "cd '$dir' && $cmd" in window 1
    end tell
EOF
}

# 2. Lanzar Web
echo "🌐 2. Lanzando Web App (Port 9001)..."
open_tab "MegaMercado-Web" "yarn workspace @megamercado/web dev -p 9001"

# Esperar un poco para que el backend esté listo
sleep 3

# 3. Lanzar iOS
echo "🍎 3. Lanzando iOS Simulator..."
open_tab "MegaMercado-iOS" "yarn workspace @megamercado/mobile ios"

# 4. Lanzar Android
echo "🤖 4. Lanzando Android Emulator..."
open_tab "MegaMercado-Android" "yarn workspace @megamercado/mobile android"

echo "------------------------------------------"
echo "✅ Todos los servicios están arrancando en pestañas separadas."
echo "------------------------------------------"
