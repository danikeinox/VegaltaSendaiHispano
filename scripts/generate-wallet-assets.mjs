/**
 * Genera assets PNG para Apple Wallet (icon, logo, strip) desde el escudo oficial.
 * Ejecutar: npm run wallet:assets
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "assets", "wallet");
const logoSvg = path.join(
  __dirname,
  "..",
  "public",
  "assets",
  "branding",
  "logo-hispano.svg"
);

const COLORS = {
  deepBlue: { r: 11, g: 37, b: 69 },
  gold: { r: 230, g: 184, b: 0 },
  yellow: { r: 245, g: 197, b: 24 },
};

async function createFromLogo(width, height, filename, fit = "contain") {
  const buffer = await sharp(logoSvg)
    .resize(width, height, {
      fit,
      background: COLORS.deepBlue,
    })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log(`Created ${filename} (${width}x${height}) from logo-hispano.svg`);
}

async function createStrip() {
  const width = 375;
  const height = 123;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgb(11,37,69)"/>
          <stop offset="60%" stop-color="rgb(201,160,0)"/>
          <stop offset="100%" stop-color="rgb(245,197,24)"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="55%" text-anchor="middle" fill="rgb(255,255,255)" font-size="26" font-weight="bold" font-family="Arial">VEGALTA SENDAI</text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
  fs.writeFileSync(path.join(outDir, "strip.png"), buffer);
  console.log("Created strip.png");
}

async function main() {
  if (!fs.existsSync(logoSvg)) {
    console.error(`Logo not found: ${logoSvg}`);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });
  await createFromLogo(58, 58, "icon.png", "cover");
  await createFromLogo(160, 50, "logo.png", "contain");
  await createStrip();
  console.log("Wallet assets ready in public/assets/wallet/");
}

main().catch(console.error);
