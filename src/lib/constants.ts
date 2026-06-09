/** Colores institucionales Vegalta Sendai (tarjeta oficial + web) */
export const VEGALTA_COLORS = {
  royalBlue: "#1A3D7C",
  deepBlue: "#0F2D5C",
  deepBlueRgb: "rgb(15, 45, 92)",
  gold: "#E8A800",
  goldLight: "#F5C842",
  goldRgb: "rgb(232, 168, 0)",
  yellow: "#F5C842",
  red: "#D41E36",
  redDark: "#B01830",
  white: "#FFFFFF",
} as const;

export const TELEGRAM_COMMUNITY_URL = "https://t.me/VegaltaIberica";
export const TELEGRAM_COMMUNITY_NAME = "Peña Ibérica Vegalta Sendai";
export const HIMNO_YOUTUBE_URL = "https://www.youtube.com/watch?v=NCHzA90i7PM";
export const HIMNO_YOUTUBE_EMBED_URL =
  "https://www.youtube-nocookie.com/embed/NCHzA90i7PM";

export const MEMBER_ID_PREFIX = "VS";
export const MEMBER_ID_PAD = 4;
/** ID reservado para vista previa del carnet (no asignado a socios reales) */
export const PREVIEW_DISPLAY_ID = "VS-0000";

export function formatMemberId(memberNumber: number): string {
  return `${MEMBER_ID_PREFIX}-${String(memberNumber).padStart(MEMBER_ID_PAD, "0")}`;
}
