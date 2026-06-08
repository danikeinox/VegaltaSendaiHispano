const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (!ALLOWED_ORIGIN) {
    return process.env.NODE_ENV === "development";
  }

  const allowed = new URL(ALLOWED_ORIGIN).origin;

  if (origin) {
    return origin === allowed;
  }

  if (referer) {
    try {
      return new URL(referer).origin === allowed;
    } catch {
      return false;
    }
  }

  return false;
}
