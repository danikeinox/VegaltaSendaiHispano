import { getAllowedSiteOrigins } from "@/lib/site-origin";

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("origin");
  const allowedOrigins = getAllowedSiteOrigins();
  const fallbackOrigin = allowedOrigins[0] ?? "*";

  const allowOrigin =
    origin && allowedOrigins.includes(origin) ? origin : fallbackOrigin;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-Locale",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
