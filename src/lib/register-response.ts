import type { Member } from "@/lib/members";
import { getWalletAvailability } from "@/lib/wallet/config";
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
    samsung: string | null;
  };
  walletAvailable: {
    apple: boolean;
    google: boolean;
    samsung: boolean;
  };
  walletsInDevelopment: boolean;
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
  const wallets = getWalletAvailability();
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
      apple: wallets.apple ? `/api/wallet/apple?${accessQuery}` : null,
      google: wallets.google ? `/api/wallet/google?${accessQuery}` : null,
      samsung: wallets.samsung ? `/api/wallet/google?${accessQuery}` : null,
    },
    walletAvailable: {
      apple: wallets.apple,
      google: wallets.google,
      samsung: wallets.samsung,
    },
    walletsInDevelopment: wallets.inDevelopment,
  };
}
