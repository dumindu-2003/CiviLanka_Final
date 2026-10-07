# Opens the CiviLanka API on a public address so the phone can use any network.
# Leave this window open. Closing it stops the public address.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$mobile = $PSScriptRoot
$urlFile = Join-Path $mobile "src\constants\publicApiUrl.js"

$listening = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  Write-Host "Start the backend first: cd Backend; npm run dev"
  exit 1
}

Write-Host "Opening a public address for port 5000..."
$tunnel = Start-Process -FilePath "npx.cmd" -ArgumentList "--yes","localtunnel","--port","5000" -WorkingDirectory $mobile -PassThru -NoNewWindow -RedirectStandardOutput (Join-Path $mobile "tunnel-out.txt") -RedirectStandardError (Join-Path $mobile "tunnel-err.txt")

$publicUrl = $null
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 1
  foreach ($log in @("tunnel-out.txt", "tunnel-err.txt")) {
    $path = Join-Path $mobile $log
    if (Test-Path $path) {
      $text = Get-Content $path -Raw -ErrorAction SilentlyContinue
      if ($text -match "https://[a-zA-Z0-9.-]+\.loca\.lt") {
        $publicUrl = $Matches[0]
        break
      }
    }
  }
  if ($publicUrl) { break }
}

if (-not $publicUrl) {
  Write-Host "Could not open a public address. Check tunnel-err.txt."
  exit 1
}

$js = @"
// Written by start-any-network.ps1. Leave that window open.
export const PUBLIC_API_URL = "$publicUrl";
"@
Set-Content -Path $urlFile -Value $js -Encoding utf8
Write-Host "Phone API address: $publicUrl/api"
Write-Host "Reload the Expo app. This window must stay open."
Wait-Process -Id $tunnel.Id
