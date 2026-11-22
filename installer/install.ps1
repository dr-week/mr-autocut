# MR-AutoCut installer: downloads and runs the latest Windows .exe (NSIS) from GitHub Releases.
$ErrorActionPreference = "Stop"
$Repo = "dr-week/mr-autocut"
Write-Host "Fetching latest MR-AutoCut release ..." -ForegroundColor Cyan
$Release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers @{ "User-Agent" = "mr-autocut-installer" }
$Asset = $Release.assets | Where-Object { $_.name -like "*-setup.exe" } | Select-Object -First 1
if (-not $Asset) { $Asset = $Release.assets | Where-Object { $_.name -like "*.exe" } | Select-Object -First 1 }
if (-not $Asset) { throw "No .exe installer found in release $($Release.tag_name)" }
$Exe = Join-Path $env:TEMP $Asset.name
Write-Host "Downloading $($Asset.name) ($($Release.tag_name)) ..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $Exe
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
}
Write-Host "Running installer ..." -ForegroundColor Cyan
Start-Process -FilePath $Exe -ArgumentList "/S" -Wait
Write-Host "Installed MR-AutoCut $($Release.tag_name). It auto-updates on launch." -ForegroundColor Green
