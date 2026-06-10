function getConfiguredSiteUrl(): string {
  const explicit =
    process.env.ALLOWED_ORIGIN?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    "";

  if (explicit) return explicit;

  if (process.env.NODE_ENV === "production") {
    return "";
  }

  return "http://localhost:3000";
}

export function getAllowedSiteOrigins(): string[] {
  const configured = getConfiguredSiteUrl().trim();
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

  return "http://localhost:3000";
}
