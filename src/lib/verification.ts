import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { PREVIEW_DISPLAY_ID } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";
import type { Member } from "@/lib/members";

export { PREVIEW_DISPLAY_ID };
export const PREVIEW_MEMBER_ID = "__preview__";
const PUBLIC_TOKEN_LENGTH = 32;
const LEGACY_TOKEN_LENGTH = 32;

export function normalizeVerificationToken(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function getVerificationSecret(): string {
  const secret = process.env.MEMBER_VERIFICATION_SECRET?.trim();
  if (secret) return secret;

  throw new Error("MEMBER_VERIFICATION_SECRET is required");
}

export function generateAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashAccessToken(rawToken: string): string {
  return createHash("sha256")
    .update(normalizeVerificationToken(rawToken))
    .digest("hex");
}

function safeCompareStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

/** Token público para verificación QR (no concede acceso al carnet). */
export function createPublicVerificationToken(displayId: string): string {
  return createHmac("sha256", getVerificationSecret())
    .update(`public:${displayId}`)
    .digest("base64url")
    .slice(0, PUBLIC_TOKEN_LENGTH);
}

export function verifyPublicVerificationToken(
  displayId: string,
  rawToken: string
): boolean {
  const token = normalizeVerificationToken(rawToken);
  if (!token || token.length !== PUBLIC_TOKEN_LENGTH) return false;

  const expected = createPublicVerificationToken(displayId);
  return safeCompareStrings(token, expected);
}

function createLegacyAccessToken(
  memberId: string,
  displayId: string
): string {
  return createHmac("sha256", getVerificationSecret())
    .update(`${memberId}:${displayId}`)
    .digest("base64url")
    .slice(0, LEGACY_TOKEN_LENGTH);
}

function verifyLegacyAccessToken(
  member: Pick<Member, "id" | "displayId">,
  rawToken: string
): boolean {
  const token = normalizeVerificationToken(rawToken);
  if (!token || token.length !== LEGACY_TOKEN_LENGTH) return false;

  const expected = createLegacyAccessToken(member.id, member.displayId);
  return safeCompareStrings(token, expected);
}

/** Token privado de acceso al carnet y Wallet. */
export function verifyPrivateAccessToken(
  member: Pick<Member, "id" | "displayId" | "accessTokenHash">,
  rawToken: string
): boolean {
  const token = normalizeVerificationToken(rawToken);
  if (!token) return false;

  if (member.accessTokenHash) {
    const expectedHash = member.accessTokenHash;
    const providedHash = hashAccessToken(token);
    if (expectedHash.length !== providedHash.length) return false;
    try {
      return timingSafeEqual(
        Buffer.from(expectedHash, "utf8"),
        Buffer.from(providedHash, "utf8")
      );
    } catch {
      return false;
    }
  }

  return verifyLegacyAccessToken(member, token);
}

/** @deprecated Usa verifyPrivateAccessToken o verifyPublicVerificationToken. */
export function verifyMemberToken(
  member: Pick<Member, "id" | "displayId" | "accessTokenHash">,
  rawToken: string
): boolean {
  return verifyPrivateAccessToken(member, rawToken);
}

export function isPreviewVerificationToken(rawToken: string): boolean {
  const token = normalizeVerificationToken(rawToken);
  if (!token || token.length !== PUBLIC_TOKEN_LENGTH) return false;

  const expected = createPublicVerificationToken(PREVIEW_DISPLAY_ID);
  return safeCompareStrings(token, expected);
}

export function buildVerificationPath(
  locale: string,
  displayId: string,
  token: string
): string {
  return `/${locale}/verificar/${encodeURIComponent(displayId)}/${token}`;
}

export function buildVerificationUrl(
  locale: string,
  displayId: string,
  token: string
): string {
  return absoluteUrl(buildVerificationPath(locale, displayId, token));
}

export function createPreviewVerificationUrl(locale: string): string {
  const token = createPublicVerificationToken(PREVIEW_DISPLAY_ID);
  return buildVerificationUrl(locale, PREVIEW_DISPLAY_ID, token);
}

export function createMemberVerificationUrl(
  locale: string,
  member: Pick<Member, "displayId">
): string {
  const token = createPublicVerificationToken(member.displayId);
  return buildVerificationUrl(locale, member.displayId, token);
}

export function buildCarnetPath(
  locale: string,
  displayId: string,
  accessToken: string
): string {
  return `/${locale}/carnet/${encodeURIComponent(displayId)}/${accessToken}`;
}

export function createMemberCarnetUrl(
  locale: string,
  member: Pick<Member, "displayId">,
  accessToken: string
): string {
  return absoluteUrl(buildCarnetPath(locale, member.displayId, accessToken));
}

export function buildMemberAccessQuery(
  member: Pick<Member, "displayId">,
  accessToken: string
): string {
  return `displayId=${encodeURIComponent(member.displayId)}&token=${encodeURIComponent(accessToken)}`;
}
