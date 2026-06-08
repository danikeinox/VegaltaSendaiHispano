import type { Locale } from "@/i18n/config";

export function localizedPath(locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "es" || segments[0] === "jp") {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return localizedPath(locale, pathname);
}
