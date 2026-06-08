import fs from "fs";
import path from "path";
import { PKPass } from "passkit-generator";
import { VEGALTA_COLORS } from "@/lib/constants";

const WALLET_ASSETS_DIR = path.join(
  process.cwd(),
  "public",
  "assets",
  "wallet"
);

export type PassMemberData = {
  displayId: string;
  firstName: string;
  lastName: string;
  email: string;
  memberNumber: number;
};

function readPemFromEnvOrFile(
  envVar: string | undefined,
  filePathEnv: string | undefined
): Buffer | null {
  if (envVar?.trim()) {
    return Buffer.from(envVar.replace(/\\n/g, "\n"), "utf-8");
  }

  if (!filePathEnv) return null;

  const resolved = path.isAbsolute(filePathEnv)
    ? filePathEnv
    : path.resolve(process.cwd(), filePathEnv);

  if (!fs.existsSync(resolved)) return null;
  return fs.readFileSync(resolved);
}

function getCertBuffers() {
  const signerCert = readPemFromEnvOrFile(
    process.env.APPLE_PASS_CERT,
    process.env.APPLE_PASS_CERT_PATH
  );
  const signerKey = readPemFromEnvOrFile(
    process.env.APPLE_PASS_KEY,
    process.env.APPLE_PASS_KEY_PATH
  );
  const wwdr = readPemFromEnvOrFile(
    process.env.APPLE_WWDR_CERT,
    process.env.APPLE_WWDR_CERT_PATH
  );

  if (!signerCert || !signerKey || !wwdr) return null;

  return {
    signerCert,
    signerKey,
    wwdr,
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
  };
}

export function isAppleWalletConfigured(): boolean {
  return getCertBuffers() !== null;
}

async function loadAsset(filename: string): Promise<Buffer> {
  const filePath = path.join(WALLET_ASSETS_DIR, filename);

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const response = await fetch(`${baseUrl}/assets/wallet/${filename}`);

  if (!response.ok) {
    throw new Error(
      `Wallet asset missing: ${filename}. Run: npm run wallet:assets`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function generateApplePass(
  member: PassMemberData
): Promise<Buffer> {
  const certs = getCertBuffers();
  if (!certs) {
    throw new Error("Apple Wallet certificates not configured");
  }

  const passTypeId =
    process.env.APPLE_PASS_TYPE_IDENTIFIER ?? "pass.com.vegalta.hispano";
  const teamId = process.env.APPLE_TEAM_IDENTIFIER ?? "VEGALTA001";
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://vegalta-hispano.example.com";

  const [icon, logo, strip] = await Promise.all([
    loadAsset("icon.png"),
    loadAsset("logo.png"),
    loadAsset("strip.png"),
  ]);

  const pass = new PKPass(
    {
      "icon.png": icon,
      "logo.png": logo,
      "strip.png": strip,
    },
    {
      wwdr: certs.wwdr,
      signerCert: certs.signerCert,
      signerKey: certs.signerKey,
      signerKeyPassphrase: certs.signerKeyPassphrase,
    },
    {
      formatVersion: 1,
      passTypeIdentifier: passTypeId,
      teamIdentifier: teamId,
      organizationName: "Vegalta Sendai Hispano",
      description: "Carnet Comunidad Hispana Vegalta Sendai",
      serialNumber: member.displayId,
      logoText: "VEGALTA SENDAI",
      foregroundColor: VEGALTA_COLORS.white,
      backgroundColor: VEGALTA_COLORS.deepBlueRgb,
      labelColor: VEGALTA_COLORS.goldRgb,
    }
  );

  pass.type = "generic";
  pass.setBarcodes(`${appUrl}/carnet/${member.displayId}`);

  pass.primaryFields.push({
    key: "member",
    label: "SOCIO",
    value: `${member.firstName} ${member.lastName}`,
  });

  pass.secondaryFields.push({
    key: "id",
    label: "ID",
    value: member.displayId,
  });

  pass.auxiliaryFields.push({
    key: "community",
    label: "COMUNIDAD",
    value: "Hispana — No oficial",
  });

  pass.backFields.push({
    key: "disclaimer",
    label: "AVISO LEGAL",
    value:
      "Carnet digital de la comunidad hispana de fans del Vegalta Sendai. No oficial, sin fines de lucro. No constituye membresía del club.",
  });

  return pass.getAsBuffer();
}
