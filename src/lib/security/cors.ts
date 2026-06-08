const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "*";

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("origin");
  const allowed = ALLOWED_ORIGIN === "*" ? "*" : new URL(ALLOWED_ORIGIN).origin;

  const allowOrigin =
    origin && (ALLOWED_ORIGIN === "*" || origin === allowed) ? origin : allowed;

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}
