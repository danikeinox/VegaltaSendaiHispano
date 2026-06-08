import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isValidLocale, localeCookie } from "@/i18n/config";

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowed =
      process.env.ALLOWED_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL;

    if (origin && allowed) {
      const allowedOrigin = new URL(allowed).origin;
      if (origin === allowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Vary", "Origin");
      }
    }
  }

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const redirectPath = pathname.replace(/^\/ja/, "/jp");
    return applySecurityHeaders(
      NextResponse.redirect(new URL(redirectPath, request.url)),
      request
    );
  }

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname === "/icon.svg" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return applySecurityHeaders(NextResponse.next(), request);
  }

  const pathnameLocale = pathname.split("/")[1];
  const hasLocalePrefix =
    isValidLocale(pathnameLocale) &&
    (pathname === `/${pathnameLocale}` ||
      pathname.startsWith(`/${pathnameLocale}/`));

  if (!hasLocalePrefix) {
    const rawCookieLocale = request.cookies.get(localeCookie)?.value;
    const cookieLocale =
      rawCookieLocale === "ja" ? "jp" : rawCookieLocale;
    const locale =
      cookieLocale && isValidLocale(cookieLocale)
        ? cookieLocale
        : defaultLocale;

    const redirectPath =
      pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

    return applySecurityHeaders(
      NextResponse.redirect(new URL(redirectPath, request.url)),
      request
    );
  }

  const response = applySecurityHeaders(NextResponse.next(), request);
  response.cookies.set(localeCookie, pathnameLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
