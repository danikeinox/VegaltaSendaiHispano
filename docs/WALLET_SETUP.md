# Configuración de Apple Wallet y Google Wallet

Guía para configurar la generación nativa de pases digitales **sin coste de licencias comerciales**.

## Apple Wallet (.pkpass)

### Requisitos

1. Cuenta gratuita de [Apple Developer](https://developer.apple.com) (99 USD/año solo para producción oficial; para desarrollo local puedes usar certificados auto-firmados).
2. Pass Type ID registrado en el portal de desarrollador.
3. Certificado de firma de pases (Pass Type ID Certificate).
4. Certificado WWDR de Apple (gratuito).

### Desarrollo local (certificado auto-firmado)

Ejecuta el script según tu sistema:

**Linux / macOS:**
```bash
chmod +x scripts/generate-pass-cert.sh
./scripts/generate-pass-cert.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\generate-pass-cert.ps1
```

Esto genera en `./certs/`:
- `signerCert.pem` — Certificado de firma
- `signerKey.pem` — Clave privada
- `wwdr.pem` — Certificado intermedio (descargado de Apple)

> **Nota:** Los pases firmados con certificados auto-firmados **no se instalarán en Apple Wallet de un iPhone real**. Sirven para validar la pipeline en desarrollo. Para producción necesitas el certificado oficial de Apple.

### Producción (gratuito con cuenta Apple Developer)

1. Ve a [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources).
2. Crea un **Pass Type ID** (ej. `pass.com.tudominio.vegalta`).
3. Genera un **Pass Type ID Certificate** y expórtalo como `.p12`.
4. Convierte a PEM:
   ```bash
   openssl pkcs12 -in Certificates.p12 -clcerts -nokeys -out certs/signerCert.pem
   openssl pkcs12 -in Certificates.p12 -nocerts -out certs/signerKey.pem
   ```
5. Descarga el WWDR G4: https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
   ```bash
   openssl x509 -inform der -in AppleWWDRCAG4.cer -out certs/wwdr.pem
   ```
6. Configura las variables en `.env`:
   ```
   APPLE_PASS_TYPE_IDENTIFIER=pass.com.tudominio.vegalta
   APPLE_TEAM_IDENTIFIER=TU_TEAM_ID
   APPLE_PASS_CERT_PATH=./certs/signerCert.pem
   APPLE_PASS_KEY_PATH=./certs/signerKey.pem
   APPLE_WWDR_CERT_PATH=./certs/wwdr.pem
   ```

### Assets visuales

```bash
node scripts/generate-wallet-assets.mjs
```

Genera `icon.png`, `logo.png` y `strip.png` en `public/assets/wallet/`. Sustitúyelos por imágenes oficiales del club para mayor fidelidad visual.

---

## Google Wallet (Save to Google Wallet)

### Requisitos (nivel gratuito Google Cloud)

1. Proyecto en [Google Cloud Console](https://console.cloud.google.com).
2. Habilitar **Google Wallet API**.
3. Crear una **Service Account** con rol de emisor de Wallet.
4. Registrar tu cuenta como **Issuer** en [Google Pay & Wallet Console](https://pay.google.com/business/console).

### Configuración

1. Crea una service account y descarga el JSON de claves.
2. Extrae `client_email` y `private_key` al `.env`:
   ```
   GOOGLE_WALLET_ISSUER_ID=3388000000000000000
   GOOGLE_WALLET_CLASS_ID=vegalta_hispano_member
   GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL=wallet@proyecto.iam.gserviceaccount.com
   GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
3. El **Issuer ID** lo obtienes en Google Pay & Wallet Console.

### Fallback Android

Si Google Wallet API no está configurada, la app ofrece descarga del archivo `.pkpass`, compatible con apps universales de Android (Pass2U, WalletPasses, etc.).

---

## Verificación

```bash
# Registro de prueba
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","country":"España"}'

# Descarga .pkpass
curl -O "http://localhost:3000/api/wallet/apple?displayId=VS-0001"
```
