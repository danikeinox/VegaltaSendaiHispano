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

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-Locale",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    return headers;
  }

  if (!isProductionRuntime() && !origin) {
    headers["Access-Control-Allow-Origin"] =
      allowedOrigins[0] ?? "http://localhost:3000";
  }

  return headers;
}
