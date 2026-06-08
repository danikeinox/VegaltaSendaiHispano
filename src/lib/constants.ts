/** Colores institucionales Vegalta Sendai */
export const VEGALTA_COLORS = {
  deepBlue: "#0B2545",
  deepBlueRgb: "rgb(11, 37, 69)",
  gold: "#E6B800",
  goldRgb: "rgb(230, 184, 0)",
  yellow: "#F5C518",
  red: "#C8102E",
  white: "#FFFFFF",
} as const;

export const MEMBER_ID_PREFIX = "VS";
export const MEMBER_ID_PAD = 4;

export function formatMemberId(memberNumber: number): string {
  return `${MEMBER_ID_PREFIX}-${String(memberNumber).padStart(MEMBER_ID_PAD, "0")}`;
}
