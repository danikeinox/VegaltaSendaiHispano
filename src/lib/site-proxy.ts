import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isValidLocale, localeCookie } from "@/i18n/config";
import {
  LOCALE_COOKIE_MAX_AGE,
  shouldPersistLocaleCookie,
} from "@/lib/locale-cookie";
import { isAllowedSiteOrigin } from "@/lib/site-origin";

const ROOT_METADATA_PATHS = new Set([
  "/favicon.ico",
  "/icon.svg",
  "/llms.txt",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
]);

/** CORS for /api only — security headers live in next.config.ts to avoid duplicates */
function applyApiCors(response: NextResponse, request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return response;
  }

  const origin = request.headers.get("origin");

  if (origin && isAllowedSiteOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }

  return response;
}

export function shouldBypassLocaleRedirect(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/.well-known/") ||
    pathname.startsWith("/.") ||
    ROOT_METADATA_PATHS.has(pathname) ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  );
}

export function handleSiteRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const redirectPath = pathname.replace(/^\/ja/, "/jp");
    return applyApiCors(
      NextResponse.redirect(new URL(redirectPath, request.url)),
      request
    );
  }

  if (shouldBypassLocaleRedirect(pathname)) {
    return applyApiCors(NextResponse.next(), request);
  }

  const pathnameLocale = pathname.split("/")[1];
  const hasLocalePrefix =
    isValidLocale(pathnameLocale) &&
    (pathname === `/${pathnameLocale}` ||
      pathname.startsWith(`/${pathnameLocale}/`));

  if (!hasLocalePrefix) {
    const rawCookieLocale = request.cookies.get(localeCookie)?.value;
    const cookieLocale = rawCookieLocale === "ja" ? "jp" : rawCookieLocale;
    const locale =
      cookieLocale && isValidLocale(cookieLocale)
        ? cookieLocale
        : defaultLocale;

    const redirectPath =
      pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

    return applyApiCors(
      NextResponse.redirect(new URL(redirectPath, request.url)),
      request
    );
  }

  const response = applyApiCors(NextResponse.next(), request);

  if (shouldPersistLocaleCookie(request)) {
    response.cookies.set(localeCookie, pathnameLocale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}
