import type { Member } from "@/lib/members";
import { isAppleWalletConfigured } from "@/lib/wallet/apple-pass";
import { isGoogleWalletConfigured } from "@/lib/wallet/google-wallet";
import {
  buildMemberAccessQuery,
  createMemberCarnetUrl,
  createMemberVerificationUrl,
} from "@/lib/verification";

export type RegisterSuccessPayload = {
  member: {
    displayId: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string | null;
    createdAt: string;
  };
  isNew: boolean;
  wallet: {
    apple: string | null;
    google: string | null;
  };
  walletAvailable: {
    apple: boolean;
    google: boolean;
  };
  verification: {
    url: string;
  };
  carnet: {
    url: string;
  };
};

export function buildRegisterSuccessPayload(
  member: Member,
  locale: string,
  accessToken: string,
  options?: { isNew?: boolean }
): RegisterSuccessPayload {
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
      createdAt: member.createdAt.toISOString(),
    },
    verification: {
      url: createMemberVerificationUrl(locale, member),
    },
    carnet: {
      url: createMemberCarnetUrl(locale, member, accessToken),
    },
    isNew: options?.isNew ?? true,
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
