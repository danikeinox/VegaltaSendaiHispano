import { isAppleWalletConfigured } from "@/lib/wallet/apple-pass";
import { isGoogleWalletConfigured } from "@/lib/wallet/google-wallet";

export type WalletProvider = "apple" | "google" | "samsung";

export type WalletAvailability = {
  /** Feature flag: wallets disabled until credentials are paid and configured */
  featureEnabled: boolean;
  inDevelopment: boolean;
  apple: boolean;
  google: boolean;
  samsung: boolean;
};

/** Master switch — set WALLETS_ENABLED=true when Apple/Google/Samsung credentials are ready */
export function isWalletsFeatureEnabled(): boolean {
  return process.env.WALLETS_ENABLED === "true";
}

/**
 * Samsung Wallet on Galaxy devices can consume Google Wallet passes once Google is live.
 * Dedicated Samsung partner API can be wired later via SAMSUNG_WALLET_ENABLED.
 */
export function isSamsungWalletConfigured(): boolean {
  if (!isWalletsFeatureEnabled()) return false;
  if (process.env.SAMSUNG_WALLET_ENABLED === "true") {
    return isGoogleWalletConfigured();
  }
  return false;
}

export function getWalletAvailability(): WalletAvailability {
  const featureEnabled = isWalletsFeatureEnabled();

  return {
    featureEnabled,
    inDevelopment: !featureEnabled,
    apple: featureEnabled && isAppleWalletConfigured(),
    google: featureEnabled && isGoogleWalletConfigured(),
    samsung: isSamsungWalletConfigured(),
  };
}

export function isAnyWalletProviderReady(): boolean {
  const availability = getWalletAvailability();
  return (
    availability.apple || availability.google || availability.samsung
  );
}
