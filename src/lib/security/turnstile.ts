import { ApiError } from "@/lib/security/error-handler";

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
  );
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return !isProductionRuntime();
  }

  if (!token?.trim()) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp === "unknown" ? "" : remoteIp,
  });

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  if (!response.ok) return false;

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export function extractTurnstileToken(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "turnstileToken" in body) {
    return String((body as { turnstileToken?: string }).turnstileToken ?? "");
  }
  return undefined;
}

export async function requireTurnstileForRequest(
  body: unknown,
  remoteIp: string,
  messages: {
    serviceUnavailable: string;
    verificationFailed: string;
  }
): Promise<void> {
  if (isProductionRuntime() && !isTurnstileConfigured()) {
    throw new ApiError(
      503,
      messages.serviceUnavailable,
      "TURNSTILE_NOT_CONFIGURED"
    );
  }

  if (!isTurnstileConfigured()) {
    return;
  }

  const valid = await verifyTurnstileToken(
    extractTurnstileToken(body),
    remoteIp
  );
  if (!valid) {
    throw new ApiError(403, messages.verificationFailed, "TURNSTILE_FAILED");
  }
}
