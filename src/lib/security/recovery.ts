import { createHash, randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import { isUpstashConfigured } from "@/lib/security/env";

const RECOVERY_TTL_SECONDS = 30 * 60;
const RECOVERY_PREFIX = "vegalta:recovery:";

export type RecoveryPayload = {
  memberId: string;
  displayId: string;
};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function generateRecoveryToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRecoveryToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function storeRecoveryToken(
  token: string,
  payload: RecoveryPayload
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Recovery tokens require Upstash Redis");
  }

  const key = `${RECOVERY_PREFIX}${hashRecoveryToken(token)}`;
  await redis.set(key, payload, { ex: RECOVERY_TTL_SECONDS });
}

export async function consumeRecoveryToken(
  token: string
): Promise<RecoveryPayload | null> {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${RECOVERY_PREFIX}${hashRecoveryToken(token)}`;
  const payload = await redis.get<RecoveryPayload>(key);
  if (!payload) return null;

  await redis.del(key);
  return payload;
}

export function isRecoveryConfigured(): boolean {
  return isUpstashConfigured();
}
