import type { Member } from "@/lib/members";
import { isAppleWalletConfigured } from "@/lib/wallet/apple-pass";
import { isGoogleWalletConfigured } from "@/lib/wallet/google-wallet";
import {
  buildMemberAccessQuery,
  createMemberCarnetUrl,
  createMemberVerificationUrl,
} from "@/lib/verification";

export function buildRegisterSuccessPayload(
  member: Member,
  locale: string,
  accessToken: string
) {
  const appleConfigured = isAppleWalletConfigured();
  const googleConfigured = isGoogleWalletConfigured();
  const accessQuery = buildMemberAccessQuery(member, accessToken);

  return {
    member: {
      displayId: member.displayId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      country: member.country,
      createdAt: member.createdAt,
    },
    verification: {
      url: createMemberVerificationUrl(locale, member),
    },
    carnet: {
      url: createMemberCarnetUrl(locale, member, accessToken),
    },
    isNew: true,
    wallet: {
      apple: appleConfigured ? `/api/wallet/apple?${accessQuery}` : null,
      google: googleConfigured ? `/api/wallet/google?${accessQuery}` : null,
    },
    walletAvailable: {
      apple: appleConfigured,
      google: googleConfigured,
    },
  };
}
