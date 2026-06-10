const PRODUCTION_SITE_ORIGIN = "https://www.vegalta.es";
const LOCAL_SITE_ORIGIN = "http://localhost:3000";

/** Quita /*, * y barras finales añadidos por error en variables de entorno. */
export function normalizeSiteUrl(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  return raw
    .trim()
    .replace(/\/+\*+$/, "")
    .replace(/\*+$/, "")
    .replace(/\/+$/, "");
}

function readConfiguredSiteUrl(): string {
  const explicit =
    normalizeSiteUrl(process.env.ALLOWED_ORIGIN) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    "";

  if (explicit) return explicit;

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  return LOCAL_SITE_ORIGIN;
}

/** URL base pública del sitio (origen, sin path ni comodines). */
export function resolveSiteBaseUrl(): string {
  const configured = readConfiguredSiteUrl();
  if (!configured) {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_SITE_ORIGIN
      : LOCAL_SITE_ORIGIN;
  }

  try {
    return new URL(configured).origin;
  } catch {
    return configured;
  }
}

export function getAllowedSiteOrigins(): string[] {
  const configured = readConfiguredSiteUrl();
  if (!configured) return [];

  try {
    const url = new URL(configured);
    const origins = new Set<string>([url.origin]);
    const host = url.hostname;

    if (host.startsWith("www.")) {
      origins.add(`${url.protocol}//${host.slice(4)}`);
    } else {
      origins.add(`${url.protocol}//www.${host}`);
    }

    return [...origins];
  } catch {
    return [];
  }
}

export function isAllowedSiteOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return getAllowedSiteOrigins().includes(origin);
}

export function getPrimarySiteOrigin(): string {
  const [primary] = getAllowedSiteOrigins();
  if (primary) return primary;

  if (process.env.NODE_ENV === "production") {
    throw new Error("ALLOWED_ORIGIN or NEXT_PUBLIC_APP_URL is required");
  }

  return LOCAL_SITE_ORIGIN;
}
