$ErrorActionPreference = "Stop"
$InstallDir = "$env:LOCALAPPDATA\MR-AutoCut"
Write-Host "Installing MR-AutoCut to $InstallDir ..." -ForegroundColor Cyan

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements }
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { irm https://astral.sh/uv/install.ps1 | iex }

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$Zip = "$env:TEMP\mr-autocut-latest.zip"
Invoke-WebRequest -Uri "https://github.com/dr-week/mr-autocut/archive/refs/heads/main.zip" -OutFile $Zip
Expand-Archive -Path $Zip -DestinationPath $InstallDir -Force
$AppRoot = Join-Path $InstallDir "mr-autocut-main"

$LaunchBat = Join-Path $InstallDir "Launch-MR-AutoCut.bat"
"@echo off`ncd /d `"$AppRoot\backend`"`nstart http://127.0.0.1:8000`nuv sync && uv run uvicorn mr_autocut.server:app --port 8000`n" | Set-Content $LaunchBat

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut("$env:USERPROFILE\Desktop\MR-AutoCut.lnk")
$Shortcut.TargetPath = $LaunchBat
$Shortcut.WorkingDirectory = $AppRoot
$Shortcut.Save()
Write-Host "Installed! Double-click MR-AutoCut on your Desktop to launch." -ForegroundColor Green
