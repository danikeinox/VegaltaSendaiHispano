/**
 * Genera .deploy-secrets.env para `wrangler secret bulk` en CI.
 * Lee process.env (inyectadas desde GitHub Secrets en el workflow).
 */
import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), ".deploy-secrets.env");

const REQUIRED = [
  "APPWRITE_API_KEY",
  "MEMBER_VERIFICATION_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

const OPTIONAL = [
  "RESEND_API_KEY",
  "TURNSTILE_SECRET_KEY",
  "API_FOOTBALL_KEY",
  "GOOGLE_WALLET_ISSUER_ID",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY",
  "APPLE_PASS_CERT",
  "APPLE_PASS_KEY",
  "APPLE_WWDR_CERT",
  "APPLE_PASS_KEY_PASSPHRASE",
];

function formatEnvLine(key, value) {
  if (value.includes("\n") || value.includes('"') || value.includes(" ")) {
    return `${key}=${JSON.stringify(value)}`;
  }
  return `${key}=${value}`;
}

const missingRequired = REQUIRED.filter((key) => !process.env[key]?.trim());
if (missingRequired.length > 0) {
  console.error(
    "Missing required deploy secrets:",
    missingRequired.join(", ")
  );
  console.error(
    "Configure them in GitHub: Settings → Secrets and variables → Actions"
  );
  process.exit(1);
}

const lines = [];

for (const key of REQUIRED) {
  lines.push(formatEnvLine(key, process.env[key].trim()));
}

for (const key of OPTIONAL) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.warn(`[deploy-secrets] Skipping optional secret: ${key}`);
    continue;
  }
  lines.push(formatEnvLine(key, value));
}

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${lines.length} secrets to ${outputPath}`);
