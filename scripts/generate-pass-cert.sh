#!/usr/bin/env bash
# Genera certificados auto-firmados para desarrollo local de Apple Wallet passes.
# Uso: ./scripts/generate-pass-cert.sh

set -euo pipefail

CERTS_DIR="$(dirname "$0")/../certs"
mkdir -p "$CERTS_DIR"

echo "==> Generando certificado auto-firmado para PassKit (desarrollo)..."

openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
  -subj "/CN=Vegalta Sendai Hispano Dev/O=Community/C=ES" \
  -keyout "$CERTS_DIR/signerKey.pem" \
  -out "$CERTS_DIR/signerCert.pem"

echo "==> Descargando certificado WWDR de Apple..."
curl -fsSL "https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer" \
  -o "$CERTS_DIR/AppleWWDRCAG4.cer"

openssl x509 -inform der -in "$CERTS_DIR/AppleWWDRCAG4.cer" \
  -out "$CERTS_DIR/wwdr.pem"

echo ""
echo "Certificados generados en $CERTS_DIR:"
echo "  - signerCert.pem"
echo "  - signerKey.pem"
echo "  - wwdr.pem"
echo ""
echo "Configura tu .env con las rutas anteriores."
echo "NOTA: Certificados auto-firmados NO funcionan en iPhone real."
echo "      Para producción usa el Pass Type ID Certificate de Apple Developer."
