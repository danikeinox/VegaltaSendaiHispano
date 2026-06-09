import { sendRecoveryEmail } from "@/lib/email/recovery";
import {
  findMemberById,
  setMemberAccessToken,
  type Member,
} from "@/lib/members";
import { buildRegisterSuccessPayload } from "@/lib/register-response";
import {
  consumeRecoveryToken,
  generateRecoveryToken,
  storeRecoveryToken,
} from "@/lib/security/recovery";
import {
  generateAccessToken,
  hashAccessToken,
} from "@/lib/verification";
import type { Locale } from "@/i18n/config";

export async function initiateMemberRecovery(
  member: Member,
  locale: Locale
): Promise<void> {
  const recoveryToken = generateRecoveryToken();
  await storeRecoveryToken(recoveryToken, {
    memberId: member.id,
    displayId: member.displayId,
  });
  await sendRecoveryEmail({
    to: member.email,
    locale,
    recoveryToken,
  });
}

export async function completeMemberRecovery(
  rawToken: string,
  locale: Locale
) {
  const token = decodeURIComponent(rawToken).trim();
  if (!token) return null;

  const payload = await consumeRecoveryToken(token);
  if (!payload) return null;

  let member = await findMemberById(payload.memberId);
  if (!member || member.displayId !== payload.displayId) {
    return null;
  }

  const accessToken = generateAccessToken();
  const tokenVersion = member.tokenVersion + 1;
  member = await setMemberAccessToken(
    member.id,
    hashAccessToken(accessToken),
    tokenVersion
  );

  return buildRegisterSuccessPayload(member, locale, accessToken);
}
