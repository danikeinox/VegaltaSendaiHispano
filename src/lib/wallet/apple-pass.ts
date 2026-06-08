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

function loadAsset(filename: string): Buffer {
  const filePath = path.join(WALLET_ASSETS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Wallet asset missing: ${filename}. Run: node scripts/generate-wallet-assets.mjs`
    );
  }
  return fs.readFileSync(filePath);
}

export type PassMemberData = {
  displayId: string;
  firstName: string;
  lastName: string;
  email: string;
  memberNumber: number;
};

function getCertBuffers() {
  const certPath = process.env.APPLE_PASS_CERT_PATH;
  const keyPath = process.env.APPLE_PASS_KEY_PATH;
  const wwdrPath = process.env.APPLE_WWDR_CERT_PATH;

  if (!certPath || !keyPath || !wwdrPath) {
    return null;
  }

  const resolve = (p: string) =>
    fs.existsSync(p) ? fs.readFileSync(p) : fs.readFileSync(path.resolve(process.cwd(), p));

  try {
    return {
      signerCert: resolve(certPath),
      signerKey: resolve(keyPath),
      wwdr: resolve(wwdrPath),
      signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
    };
  } catch {
    return null;
  }
}

export function isAppleWalletConfigured(): boolean {
  return getCertBuffers() !== null;
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

  const pass = new PKPass(
    {
      "icon.png": loadAsset("icon.png"),
      "logo.png": loadAsset("logo.png"),
      "strip.png": loadAsset("strip.png"),
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

