import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { FREE_TIER_LIMITS } from "@/lib/limits";
import { isUpstashConfigured } from "@/lib/security/env";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function requireUpstashOrDev(): void {
  if (isProductionRuntime() && !isUpstashConfigured()) {
    throw new Error("Upstash Redis is required for rate limiting in production");
  }
}

function memoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetAt,
  };
}

let registrationLimiter: Ratelimit | null = null;
let dailyRegistrationLimiter: Ratelimit | null = null;
let memberLookupLimiter: Ratelimit | null = null;
let recoveryLimiter: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getUpstashLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (!registrationLimiter) {
    registrationLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "vegalta:register",
    });
  }

  return registrationLimiter;
}

function getDailyRegistrationLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (!dailyRegistrationLimiter) {
    dailyRegistrationLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        FREE_TIER_LIMITS.dailyNewRegistrations,
        "1 d"
      ),
      analytics: true,
      prefix: "vegalta:register:daily",
    });
  }

  return dailyRegistrationLimiter;
}

function getRecoveryLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (!recoveryLimiter) {
    recoveryLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "15 m"),
      analytics: true,
      prefix: "vegalta:recover",
    });
  }

  return recoveryLimiter;
}

export async function checkDailyRegistrationQuota(): Promise<RateLimitResult> {
  requireUpstashOrDev();
  const upstash = getDailyRegistrationLimiter();

  if (upstash) {
    const result = await upstash.limit("global");
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryRateLimit(
    "register:daily:global",
    FREE_TIER_LIMITS.dailyNewRegistrations,
    86_400_000
  );
}

export async function checkRegistrationRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  requireUpstashOrDev();
  const upstash = getUpstashLimiter();

  if (upstash) {
    const result = await upstash.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryRateLimit(`register:${identifier}`, 5, 60_000);
}

function getMemberLookupLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  if (!memberLookupLimiter) {
    memberLookupLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "vegalta:member",
    });
  }

  return memberLookupLimiter;
}

export async function checkMemberLookupRateLimit(
  ip: string
): Promise<RateLimitResult> {
  requireUpstashOrDev();
  const upstash = getMemberLookupLimiter();

  if (upstash) {
    const result = await upstash.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryRateLimit(`member:${ip}`, 30, 60_000);
}

export async function checkRecoveryRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  requireUpstashOrDev();
  const upstash = getRecoveryLimiter();

  if (upstash) {
    const result = await upstash.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryRateLimit(`recover:${identifier}`, 3, 900_000);
}
