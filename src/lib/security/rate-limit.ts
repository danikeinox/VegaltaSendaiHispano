import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { FREE_TIER_LIMITS } from "@/lib/limits";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const memoryStore = new Map<string, { count: number; resetAt: number }>();

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

function getUpstashLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  if (!registrationLimiter) {
    registrationLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "vegalta:register",
    });
  }

  return registrationLimiter;
}

function getDailyRegistrationLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  if (!dailyRegistrationLimiter) {
    dailyRegistrationLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
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

export async function checkDailyRegistrationQuota(): Promise<RateLimitResult> {
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
  ip: string
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter();

  if (upstash) {
    const result = await upstash.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return memoryRateLimit(`register:${ip}`, 5, 60_000);
}
