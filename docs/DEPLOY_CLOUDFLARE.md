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
2. Proyecto Appwrite configurado (`npm run appwrite:setup`)
3. Wrangler CLI autenticado: `npx wrangler login` (solo para despliegue manual)

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

## 4. Despliegue automático en cada push a `main`

El repo incluye **GitHub Actions** (`.github/workflows/deploy-cloudflare.yml`) que publica el Worker en cada push a `main` o `master`.

### Secrets en GitHub (obligatorios)

En **GitHub → Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Cómo obtenerlo |
|--------|----------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token → plantilla **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → página principal de la cuenta (columna derecha) |

### Secrets en Cloudflare Worker (runtime)

Los secretos de runtime (Appwrite, Upstash, certificados Apple, etc.) se configuran **una vez** en el Worker de Cloudflare, no en GitHub:

Workers & Pages → `vegalta-endai-hispano` → Settings → Variables and Secrets

El workflow solo inyecta variables `NEXT_PUBLIC_*` públicas necesarias durante el build.

### Evitar despliegues duplicados

Si también tienes **Workers Builds** conectado al mismo repo en Cloudflare, **desactívalo** o desconecta el repositorio. Si no, cada push desplegará dos veces (GitHub Actions + Cloudflare Builds).

### Alternativa: Workers Builds (solo Cloudflare)

> **IMPORTANTE:** Usa **Cloudflare Workers + OpenNext**, NO Cloudflare Pages con `@cloudflare/next-on-pages`.
>
> Si en los logs ves `npx @cloudflare/next-on-pages@1` o errores de `export const runtime = 'edge'`, tu proyecto está configurado como **Pages** con el adaptador obsoleto.

| Campo | Valor |
|-------|-------|
| Framework preset | **None** |
| Node.js version | **22** |
| Build command | `npm run build:cf` |
| Deploy command | `npx wrangler deploy` |

4. Añade variables/secrets de runtime en Cloudflare
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

### Error: `next-on-pages` / `runtime = 'edge'` / `Invalid prerender config`

**Causa:** Cloudflare Pages con `@cloudflare/next-on-pages` (obsoleto). Esta app usa APIs Node.js (Appwrite, PassKit, crypto) que **no funcionan** en Edge Runtime.

**Solución:**
1. Crea o migra a un proyecto **Workers** (no Pages).
2. Framework preset → **None**.
3. Build → `npm run build:cf`, Deploy → `npx wrangler deploy`.
4. Asegúrate de tener el commit más reciente (incluye `"adapter": "@opennextjs/cloudflare"` en `package.json`).

### `Apple Wallet not configured`
Los certificados deben estar en secrets `APPLE_PASS_CERT`, `APPLE_PASS_KEY`, `APPLE_WWDR_CERT`.

### `Origen no permitido` al registrar
`ALLOWED_ORIGIN` debe coincidir exactamente con el dominio (incluyendo `https://`).

### Error de conexión a Appwrite
Verifica `APPWRITE_API_KEY` y los IDs de database/collections como secrets en Cloudflare.

### Rate limiting inconsistente
Configura Upstash Redis; el fallback en memoria no funciona entre Workers.
