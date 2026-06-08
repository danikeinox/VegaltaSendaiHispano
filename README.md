# Vegalta Sendai Hispano — Carnet Digital

Aplicación web de producción para la **comunidad hispana de fans del Vegalta Sendai**. Permite el registro gratuito de socios y la generación de carnets digitales integrables en **Apple Wallet** y **Google Wallet**.

> Proyecto **no oficial**, sin fines de lucro, open-source bajo licencia MIT.

## Características

- Registro gratuito con validación Zod y rate limiting (5 req/min por IP)
- IDs consecutivos atómicos (`VS-0001`, `VS-0002`...) vía Appwrite `incrementDocumentAttribute`
- Carnet digital SVG fiel a la estética del club (azul, oro, rojo)
- Generación nativa `.pkpass` (PassKit / `passkit-generator`)
- Integración Google Wallet via JWT firmado (Save to Google Wallet)
- Backend [Appwrite Cloud](https://cloud.appwrite.io) — base de datos, sin servidor propio
- Seguridad OWASP: CSP, HSTS, CSRF por origen, CORS restringido

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/ui |
| Backend | API Routes Next.js + Appwrite Databases |
| Base de datos | Appwrite Cloud (Frankfurt) |
| Rate limiting | Upstash Redis |
| Wallets | passkit-generator, jsonwebtoken |

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/danikeinox/VegaltaSendaiHispano.git
cd VegaltaSendaiHispano
npm install
```

### 2. Configurar Appwrite

```bash
cp .env.example .env
```

Añade tu `APPWRITE_API_KEY` desde la [consola de Appwrite](https://cloud.appwrite.io).

Guía completa: **[docs/APPWRITE_SETUP.md](docs/APPWRITE_SETUP.md)**

### 3. Crear base de datos y colecciones

```bash
npm run appwrite:setup
```

### 4. Assets de wallet y certificados

```bash
npm run wallet:assets
.\scripts\generate-pass-cert.ps1   # Windows — Apple Wallet dev
```

### 5. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Al cargar, `client.ping()` verifica la conexión con Appwrite automáticamente.

## Despliegue en Cloudflare Workers

```bash
npm run deploy
```

Guía: **[docs/DEPLOY_CLOUDFLARE.md](docs/DEPLOY_CLOUDFLARE.md)**

## Estructura del proyecto

```
src/
├── lib/
│   ├── appwrite.ts          # SDK cliente (browser)
│   ├── appwrite-server.ts   # SDK servidor (API routes)
│   └── members.ts           # Registro e IDs consecutivos
├── components/
│   ├── appwrite-ping.tsx    # Verificación client.ping()
│   └── membership-card.tsx  # Carnet SVG
└── app/api/
    ├── register/            # POST registro
    └── wallet/              # Apple + Google Wallet
```

## Licencia

MIT — Ver [LICENSE](LICENSE).

## Aviso legal

Carnet de la comunidad hispana de aficionados. **No afiliado al Vegalta Sendai oficial.**
