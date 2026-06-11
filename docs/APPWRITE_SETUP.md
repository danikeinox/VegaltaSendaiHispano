# Configuración de Appwrite

Base de datos y backend para Vegalta Sendai Hispano usando [Appwrite Cloud](https://cloud.appwrite.io).

## Proyecto configurado

| Variable | Valor |
|----------|-------|
| Project ID | `6a2702ec000b42a91782` |
| Project Name | `VegaltaSendaiHispano` |
| Endpoint | `https://fra.cloud.appwrite.io/v1` |

## 1. Crear API Key

1. Ve a [Appwrite Console](https://cloud.appwrite.io) → tu proyecto **VegaltaSendaiHispano**
2. **Overview** → **API Keys** → **Create API Key**
3. Nombre: `Vegalta Server`
4. Scopes: `databases.read`, `databases.write`
5. Copia la clave a `APPWRITE_API_KEY` en tu `.env`

## 2. Configurar entorno local

```bash
cp .env.example .env
```

Edita `.env` y añade tu `APPWRITE_API_KEY`.

## 3. Crear base de datos y colecciones

```bash
npm run appwrite:setup
```

Este script crea automáticamente:

| Recurso | ID | Descripción |
|---------|-----|-------------|
| Database | `vegalta_sendai` | Base de datos principal |
| Collection | `members` | Socios registrados |
| Collection | `id_sequence` | Contador atómico VS-0001... |
| Document | `member_counter` | Secuencia inicializada en `0` |

### Esquema `members`

| Atributo | Tipo | Único |
|----------|------|-------|
| memberNumber | Integer | Sí |
| displayId | String | Sí |
| firstName | String | — |
| lastName | String | — |
| email | Email | Sí |
| country | String | — |

### IDs consecutivos

El contador usa `incrementDocumentAttribute` de Appwrite (operación atómica en servidor), equivalente seguro al `SELECT FOR UPDATE` de PostgreSQL.

### Protección de datos

Las colecciones quedan sin permisos públicos y deben operarse desde las API
server-side. Para borrado de socios, rotación de tokens y respuesta ante
incidentes, consulta [DATA_PROTECTION_RUNBOOK.md](DATA_PROTECTION_RUNBOOK.md).

## 4. Verificar conexión

```bash
npm run dev
```

Al abrir http://localhost:3000, el componente `AppwritePing` ejecuta `client.ping()` automáticamente. En la consola del navegador deberías ver:

```
[Appwrite] Conexión verificada correctamente
```

## 5. Variables en producción (Cloudflare)

```bash
npx wrangler secret put APPWRITE_API_KEY
npx wrangler secret put APPWRITE_DATABASE_ID
npx wrangler secret put APPWRITE_MEMBERS_COLLECTION_ID
npx wrangler secret put APPWRITE_SEQUENCE_COLLECTION_ID
npx wrangler secret put NEXT_PUBLIC_APPWRITE_PROJECT_ID
npx wrangler secret put NEXT_PUBLIC_APPWRITE_ENDPOINT
```

Las variables `NEXT_PUBLIC_*` también pueden ir en **Environment variables** (no secrets) del dashboard de Cloudflare.

## SDKs utilizados

| Contexto | Paquete | Archivo |
|----------|---------|---------|
| Cliente (browser) | `appwrite` | `src/lib/appwrite.ts` |
| Servidor (API routes) | `node-appwrite` | `src/lib/appwrite-server.ts` |
