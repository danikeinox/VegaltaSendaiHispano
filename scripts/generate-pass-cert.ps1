# Genera certificados auto-firmados para desarrollo local de Apple Wallet passes.
# Uso: .\scripts\generate-pass-cert.ps1

$CertsDir = Join-Path $PSScriptRoot ".." "certs"
New-Item -ItemType Directory -Force -Path $CertsDir | Out-Null

Write-Host "==> Generando certificado auto-firmado para PassKit (desarrollo)..."

openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 `
  -subj "/CN=Vegalta Sendai Hispano Dev/O=Community/C=ES" `
  -keyout (Join-Path $CertsDir "signerKey.pem") `
  -out (Join-Path $CertsDir "signerCert.pem")

Write-Host "==> Descargando certificado WWDR de Apple..."
$wwdrCer = Join-Path $CertsDir "AppleWWDRCAG4.cer"
Invoke-WebRequest -Uri "https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer" `
  -OutFile $wwdrCer

openssl x509 -inform der -in $wwdrCer -out (Join-Path $CertsDir "wwdr.pem")

Write-Host ""
Write-Host "Certificados generados en $CertsDir"
Write-Host "  - signerCert.pem"
Write-Host "  - signerKey.pem"
Write-Host "  - wwdr.pem"
Write-Host ""
Write-Host "NOTA: Certificados auto-firmados NO funcionan en iPhone real."
