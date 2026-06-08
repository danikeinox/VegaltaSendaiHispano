import { MEMBER_ID_PAD } from "@/lib/constants";

/**
 * Límites derivados de los planes gratuitos del stack:
 * - Appwrite Cloud Free: ~50.000 documentos (reservamos margen)
 * - IDs VS-0001…VS-9999: máximo numérico del formato
 * - Cloudflare Workers Free: ~100.000 peticiones/día
 * - Upstash Redis Free: ~10.000 comandos/día
 */
export const FREE_TIER_LIMITS = {
  /** Máximo por formato VS-0001 … VS-9999 */
  maxMemberNumber: 10 ** MEMBER_ID_PAD - 1,
  /** Techo conservador de documentos en Appwrite (90 % del free tier) */
  appwriteDocumentBudget: 45_000,
  /** Nuevos registros por día (global) */
  dailyNewRegistrations: 150,
} as const;

export const MAX_MEMBERS = Math.min(
  FREE_TIER_LIMITS.maxMemberNumber,
  FREE_TIER_LIMITS.appwriteDocumentBudget
);

export type CapacityStatus = {
  currentMembers: number;
  maxMembers: number;
  remainingSlots: number;
  isFull: boolean;
};

export function buildCapacityStatus(currentMembers: number): CapacityStatus {
  const maxMembers = MAX_MEMBERS;
  const remainingSlots = Math.max(0, maxMembers - currentMembers);

  return {
    currentMembers,
    maxMembers,
    remainingSlots,
    isFull: currentMembers >= maxMembers,
  };
}
