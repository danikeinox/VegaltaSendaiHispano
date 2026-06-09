import type { NextRequest } from "next/server";
import { localeCookie, type Locale } from "@/i18n/config";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isPrefetchRequest(request: NextRequest): boolean {
  if (
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("sec-purpose") === "prefetch"
  ) {
    return true;
  }

  const dest = request.headers.get("sec-fetch-dest");
  const mode = request.headers.get("sec-fetch-mode");

  return dest === "empty" && mode === "cors" && request.headers.has("next-url");
}

export function shouldPersistLocaleCookie(request: NextRequest): boolean {
  if (isPrefetchRequest(request)) {
    return false;
  }

  const dest = request.headers.get("sec-fetch-dest");
  const mode = request.headers.get("sec-fetch-mode");

  if (dest === "document" && mode === "navigate") {
    return true;
  }

  if (!dest && !mode) {
    const accept = request.headers.get("accept") ?? "";
    return accept.includes("text/html");
  }

  return false;
}

export function setLocaleCookieClient(locale: Locale): void {
  document.cookie = `${localeCookie}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
