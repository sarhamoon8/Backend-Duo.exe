# Levanta el stack completo de FilaCero (base de datos + backend + frontend).
# Si el repo del frontend no esta clonado al lado de este, lo clona solo.
# Uso: .\setup.ps1   (desde la raiz de este repo)

$ErrorActionPreference = "Stop"

$frontendPath = if ($env:FRONTEND_PATH) { $env:FRONTEND_PATH } else { "../Fronted-Duo.exe" }
$frontendUrl = "https://github.com/sarhamoon8/Fronted-Duo.exe.git"
$frontendBranch = if ($env:FRONTEND_BRANCH) { $env:FRONTEND_BRANCH } else { "desarrollo" }

if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
    Write-Host "No se encontro el frontend en '$frontendPath'. Clonando rama '$frontendBranch' desde GitHub..."
    git clone --branch $frontendBranch $frontendUrl $frontendPath
} else {
    Write-Host "Frontend encontrado en '$frontendPath'."
}

docker compose up --build
