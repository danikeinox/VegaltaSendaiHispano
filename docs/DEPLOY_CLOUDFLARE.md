# Despliegue en Cloudflare Workers

Guía para desplegar Vegalta Sendai Hispano en **Cloudflare Workers** usando el adaptador [OpenNext](https://opennext.js.org/cloudflare).

## Arquitectura recomendada (coste cero)

| Componente | Servicio |
|------------|----------|
| Hosting | Cloudflare Workers (plan Free) |
| Base de datos | [Appwrite Cloud](https://cloud.appwrite.io) Free Tier |
| Rate limiting | [Upstash Redis](https://upstash.com) Free Tier (**obligatorio** en Cloudflare) |
| Dominio | Cloudflare DNS (opcional) |

> En Cloudflare Workers **no hay memoria compartida** entre instancias. El rate limiting en memoria local no funciona en producción: configura Upstash Redis.

## Requisitos previos

1. Cuenta en [Cloudflare](https://dash.cloudflare.com)
2. Base de datos PostgreSQL en Neon (recomendado) o Supabase
3. Wrangler CLI autenticado: `npx wrangler login`

## 1. Base de datos (Appwrite)

1. Proyecto ya creado: **VegaltaSendaiHispano** (`6a2702ec000b42a91782`)
2. Crea una API Key con scopes `databases.read` + `databases.write`
3. Ejecuta el setup **desde tu máquina local**:

```bash
APPWRITE_API_KEY="tu_clave" npm run appwrite:setup
```

Guía detallada: [APPWRITE_SETUP.md](APPWRITE_SETUP.md)

## 2. Variables de entorno (Secrets)

En Cloudflare Workers los secretos **no se leen desde archivos `.pem`**. Debes inyectarlos como variables:

### Dashboard Cloudflare

Workers & Pages → tu Worker → Settings → Variables and Secrets

### O vía CLI

```bash
npx wrangler secret put APPWRITE_API_KEY
npx wrangler secret put APPWRITE_DATABASE_ID
npx wrangler secret put APPWRITE_MEMBERS_COLLECTION_ID
npx wrangler secret put APPWRITE_SEQUENCE_COLLECTION_ID
npx wrangler secret put NEXT_PUBLIC_APPWRITE_PROJECT_ID
npx wrangler secret put NEXT_PUBLIC_APPWRITE_ENDPOINT
npx wrangler secret put NEXT_PUBLIC_APP_URL
npx wrangler secret put ALLOWED_ORIGIN
npx wrangler secret put UPSTASH_REDIS_REST_URL
npx wrangler secret put UPSTASH_REDIS_REST_TOKEN

# Certificados Apple (contenido PEM completo, no rutas)
npx wrangler secret put APPLE_PASS_CERT
npx wrangler secret put APPLE_PASS_KEY
npx wrangler secret put APPLE_WWDR_CERT
npx wrangler secret put APPLE_PASS_TYPE_IDENTIFIER
npx wrangler secret put APPLE_TEAM_IDENTIFIER

# Google Wallet (opcional)
npx wrangler secret put GOOGLE_WALLET_ISSUER_ID
npx wrangler secret put GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL
npx wrangler secret put GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY
```

### Certificados Apple en Cloudflare

Convierte tus `.pem` a una sola línea para el secret (o pega el PEM multilínea directamente):

```powershell
# Windows — copiar contenido al portapapeles
Get-Content .\certs\signerCert.pem | Set-Clipboard
```

Pega el valor en `APPLE_PASS_CERT`, repite para `APPLE_PASS_KEY` y `APPLE_WWDR_CERT`.

### URLs obligatorias

```
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
ALLOWED_ORIGIN=https://tu-dominio.com
```

Ambas deben coincidir con tu dominio de producción (CSRF/CORS).

## 3. Despliegue manual (CLI)

```bash
npm install
npm run wallet:assets
npm run deploy
```

Esto ejecuta `opennextjs-cloudflare build` + `opennextjs-cloudflare deploy`.

### Preview local (runtime Workers)

```bash
cp .dev.vars.example .dev.vars
# Edita .dev.vars con tus valores locales

npm run preview
```

Abre `http://localhost:8787`.

## 4. Despliegue automático (GitHub + Workers Builds)

1. En Cloudflare Dashboard → **Workers & Pages** → **Create** → **Connect to Git**
2. Selecciona el repo `danikeinox/VegaltaSendaiHispano`
3. Configura el build:

| Campo | Valor |
|-------|-------|
| Framework preset | None (o detecta Next.js) |
| Build command | `npm run build` |
| Deploy command | `npx opennextjs-cloudflare build && npx wrangler deploy` |

4. Añade todas las variables/secrets en la sección **Environment variables**
5. Conecta tu dominio personalizado en **Custom domains**

## 5. Checklist post-despliegue

- [ ] `NEXT_PUBLIC_APP_URL` y `ALLOWED_ORIGIN` apuntan al dominio real
- [ ] Upstash Redis configurado (rate limiting)
- [ ] Appwrite configurado (`npm run appwrite:setup`)
- [ ] Certificados Apple como secrets PEM (no rutas de archivo)
- [ ] Registro de prueba funciona (`POST /api/register`)
- [ ] Descarga `.pkpass` funciona (`GET /api/wallet/apple?displayId=VS-0001`)

## Límites del plan Free de Workers

- Tamaño Worker comprimido: **~3 MiB** (gzip). Si el build supera el límite, considera el plan Paid (10 MiB).
- CPU time limitado por request.
- Para caché ISR avanzado, habilita un bucket R2 (opcional, ver [OpenNext Caching](https://opennext.js.org/cloudflare/caching)).

## Solución de problemas

### `Apple Wallet not configured`
Los certificados deben estar en secrets `APPLE_PASS_CERT`, `APPLE_PASS_KEY`, `APPLE_WWDR_CERT`.

### `Origen no permitido` al registrar
`ALLOWED_ORIGIN` debe coincidir exactamente con el dominio (incluyendo `https://`).

### Error de conexión a Appwrite
Verifica `APPWRITE_API_KEY` y los IDs de database/collections como secrets en Cloudflare.

### Rate limiting inconsistente
Configura Upstash Redis; el fallback en memoria no funciona entre Workers.
