import { createHmac, timingSafeEqual } from "node:crypto";
import { PREVIEW_DISPLAY_ID } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";
import type { Member } from "@/lib/members";

export { PREVIEW_DISPLAY_ID };
export const PREVIEW_MEMBER_ID = "__preview__";
const TOKEN_LENGTH = 32;

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

export function createVerificationToken(
  memberId: string,
  displayId: string
): string {
  return createHmac("sha256", getVerificationSecret())
    .update(`${memberId}:${displayId}`)
    .digest("base64url")
    .slice(0, TOKEN_LENGTH);
}

export function verifyMemberToken(member: Member, rawToken: string): boolean {
  const token = normalizeVerificationToken(rawToken);
  if (!token || token.length !== TOKEN_LENGTH) return false;

  const expected = createVerificationToken(member.id, member.displayId);

  try {
    return timingSafeEqual(
      Buffer.from(token, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
}

export function isPreviewVerificationToken(rawToken: string): boolean {
  const token = normalizeVerificationToken(rawToken);
  if (!token || token.length !== TOKEN_LENGTH) return false;

  const expected = createVerificationToken(
    PREVIEW_MEMBER_ID,
    PREVIEW_DISPLAY_ID
  );

  try {
    return timingSafeEqual(
      Buffer.from(token, "utf8"),
      Buffer.from(expected, "utf8")
    );
  } catch {
    return false;
  }
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
  const token = createVerificationToken(PREVIEW_MEMBER_ID, PREVIEW_DISPLAY_ID);
  return buildVerificationUrl(locale, PREVIEW_DISPLAY_ID, token);
}

export function createMemberAccessToken(
  member: Pick<Member, "id" | "displayId">
): string {
  return createVerificationToken(member.id, member.displayId);
}

export function createMemberVerificationUrl(
  locale: string,
  member: Pick<Member, "id" | "displayId">
): string {
  const token = createMemberAccessToken(member);
  return buildVerificationUrl(locale, member.displayId, token);
}

export function buildCarnetPath(
  locale: string,
  displayId: string,
  token: string
): string {
  return `/${locale}/carnet/${encodeURIComponent(displayId)}/${token}`;
}

export function createMemberCarnetUrl(
  locale: string,
  member: Pick<Member, "id" | "displayId">
): string {
  const token = createMemberAccessToken(member);
  return absoluteUrl(buildCarnetPath(locale, member.displayId, token));
}

export function buildMemberAccessQuery(
  member: Pick<Member, "id" | "displayId">
): string {
  const token = createMemberAccessToken(member);
  return `displayId=${encodeURIComponent(member.displayId)}&token=${encodeURIComponent(token)}`;
}
