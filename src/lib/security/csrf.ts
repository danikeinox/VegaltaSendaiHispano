import { getAllowedSiteOrigins } from "@/lib/site-origin";

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedSiteOrigins();

  if (allowedOrigins.length === 0) {
    return process.env.NODE_ENV === "development";
  }

  function isDevLocalOrigin(value: string): boolean {
    if (process.env.NODE_ENV !== "development") return false;
    try {
      const { hostname } = new URL(value);
      return hostname === "localhost" || hostname === "127.0.0.1";
    } catch {
      return false;
    }
  }

  if (origin) {
    return allowedOrigins.includes(origin) || isDevLocalOrigin(origin);
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return (
        allowedOrigins.includes(refererOrigin) || isDevLocalOrigin(refererOrigin)
      );
    } catch {
      return false;
    }
  }

  return false;
}
