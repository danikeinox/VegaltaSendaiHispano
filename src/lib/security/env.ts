import { getAllowedSiteOrigins } from "@/lib/site-origin";

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function assertProductionSecurityConfig(): void {
  if (!isProductionRuntime()) return;

  const missing: string[] = [];

  if (getAllowedSiteOrigins().length === 0) {
    missing.push("ALLOWED_ORIGIN or NEXT_PUBLIC_APP_URL");
  }

  if (
    !process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    !process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    missing.push("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
  }

  if (!process.env.MEMBER_VERIFICATION_SECRET?.trim()) {
    missing.push("MEMBER_VERIFICATION_SECRET");
  }

  if (!process.env.APPWRITE_API_KEY?.trim()) {
    missing.push("APPWRITE_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Production security misconfiguration. Missing: ${missing.join(", ")}`
    );
  }
}

export function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}
