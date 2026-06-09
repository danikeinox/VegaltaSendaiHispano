function getConfiguredSiteUrl(): string {
  return (
    process.env.ALLOWED_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "https://www.vegalta.es"
  );
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
  return primary ?? "https://www.vegalta.es";
}
