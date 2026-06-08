# Vegalta Sendai Hispano — Carnet Digital

Aplicación web de producción para la **comunidad hispana de fans del Vegalta Sendai**. Permite el registro gratuito de socios y la generación de carnets digitales integrables en **Apple Wallet** y **Google Wallet**.

> Proyecto **no oficial**, sin fines de lucro, open-source bajo licencia MIT.

## Características

- Registro gratuito con validación Zod y rate limiting (5 req/min por IP)
- IDs consecutivos atómicos (`VS-0001`, `VS-0002`...) con `SELECT FOR UPDATE`
- Carnet digital SVG fiel a la estética del club (azul, oro, rojo)
- Generación nativa `.pkpass` (PassKit / `passkit-generator`)
- Integración Google Wallet via JWT firmado (Save to Google Wallet)
- Seguridad OWASP: CSP, HSTS, CSRF por origen, CORS restringido, errores genéricos

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Shadcn/ui |
| Backend | API Routes Next.js |
| Base de datos | PostgreSQL + Prisma ORM |
| Rate limiting | Upstash Redis (opcional) o memoria local |
| Wallets | passkit-generator, jsonwebtoken |

## Inicio rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/danikeinox/VegaltaSendaiHispano.git
cd VegaltaSendaiHispano
npm install
```

### 2. Configurar entorno

```bash
cp .env.example .env
```

Edita `.env` con tu `DATABASE_URL` (Neon, Supabase o PostgreSQL local).

### 3. Base de datos

```bash
npx prisma migrate deploy
npm run db:seed
```

### 4. Assets de wallet

```bash
npm run wallet:assets
```

### 5. Certificados Apple (desarrollo)

```powershell
# Windows
.\scripts\generate-pass-cert.ps1
```

```bash
# Linux/macOS
./scripts/generate-pass-cert.sh
```

Consulta [docs/WALLET_SETUP.md](docs/WALLET_SETUP.md) para producción.

### 6. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── register/          # POST registro de socio
│   │   ├── member/[displayId] # GET consulta socio
│   │   └── wallet/
│   │       ├── apple/         # GET descarga .pkpass
│   │       └── google/        # GET/POST Save to Google Wallet
│   ├── carnet/[displayId]/    # Página pública del carnet
│   └── page.tsx               # Landing + formulario
├── components/
│   ├── membership-card.tsx    # Carnet SVG
│   ├── registration-form.tsx
│   └── ui/                    # Shadcn components
└── lib/
    ├── member-id.ts           # ID consecutivo atómico
    ├── security/              # Rate limit, CSRF, CORS, errores
    └── wallet/                # Apple Pass + Google JWT
```

## API

### `POST /api/register`

```json
{
  "firstName": "Juan",
  "lastName": "García",
  "email": "juan@example.com",
  "country": "España"
}
```

### `GET /api/wallet/apple?displayId=VS-0001`

Descarga archivo `.pkpass`.

### `GET /api/wallet/google?displayId=VS-0001`

Devuelve URL de Save to Google Wallet o fallback `.pkpass`.

## Despliegue (coste cero)

| Servicio | Proveedor gratuito |
|----------|-------------------|
| Hosting | Vercel Hobby |
| PostgreSQL | Neon / Supabase Free |
| Redis | Upstash Free (10k req/día) |

## Licencia

MIT — Uso y modificación libres. Ver [LICENSE](LICENSE).

## Aviso legal

Este carnet es un proyecto de la comunidad hispana de aficionados. **No está afiliado ni avalado por el Vegalta Sendai oficial.**
