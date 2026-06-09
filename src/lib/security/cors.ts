import { getAllowedSiteOrigins } from "@/lib/site-origin";

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("origin");
  const allowedOrigins = getAllowedSiteOrigins();

  if (isProductionRuntime() && allowedOrigins.length === 0) {
    return {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Requested-With, X-Locale",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
  }

  const allowOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0] ?? "http://localhost:3000";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-Locale",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
