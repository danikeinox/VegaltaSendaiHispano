const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!ALLOWED_ORIGIN) {
    return process.env.NODE_ENV === "development";
  }

  const allowed = new URL(ALLOWED_ORIGIN).origin;

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
    return origin === allowed || isDevLocalOrigin(origin);
  }

  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return refererOrigin === allowed || isDevLocalOrigin(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}
