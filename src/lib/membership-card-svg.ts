import { VEGALTA_COLORS } from "@/lib/constants";

export type MembershipCardSvgData = {
  displayId: string;
  firstName: string;
  lastName: string;
  officialCardLabel?: string;
  logoHref?: string;
  idPrefix?: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildMembershipCardSvg({
  displayId,
  firstName,
  lastName,
  officialCardLabel = "CARNET FAN OFICIAL",
  logoHref = "/assets/branding/logo-hispano.svg",
  idPrefix = "mc",
}: MembershipCardSvgData): string {
  const fullName = `${firstName} ${lastName}`.trim().toUpperCase();
  const displayName =
    fullName.length > 26 ? `${fullName.slice(0, 23)}...` : fullName;
  const engravedId = displayId.toUpperCase();
  const bgDiag = `${idPrefix}-bgDiag`;
  const vegaltStroke = `${idPrefix}-vegaltStroke`;
  const machineEngrave = `${idPrefix}-machineEngrave`;

  return `<svg viewBox="0 0 520 325" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Carnet digital ${escapeXml(displayId)}">
  <defs>
    <linearGradient id="${bgDiag}" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${VEGALTA_COLORS.deepBlue}" />
      <stop offset="30%" stop-color="${VEGALTA_COLORS.royalBlue}" />
      <stop offset="50%" stop-color="${VEGALTA_COLORS.red}" />
      <stop offset="75%" stop-color="#E8B020" />
      <stop offset="100%" stop-color="${VEGALTA_COLORS.goldLight}" />
    </linearGradient>
    <filter id="${vegaltStroke}" x="-4%" y="-4%" width="108%" height="108%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="dilated" />
      <feFlood flood-color="white" result="white" />
      <feComposite in="white" in2="dilated" operator="in" result="outline" />
      <feMerge>
        <feMergeNode in="outline" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="${machineEngrave}" x="-30%" y="-30%" width="160%" height="160%">
      <feFlood flood-color="#000000" flood-opacity="0.65" result="shadowColor" />
      <feComposite in="shadowColor" in2="SourceAlpha" operator="in" result="shadow" />
      <feOffset in="shadow" dx="1.2" dy="1.4" result="shadowOffset" />
      <feFlood flood-color="#ffffff" flood-opacity="0.22" result="hiColor" />
      <feComposite in="hiColor" in2="SourceAlpha" operator="in" result="highlight" />
      <feOffset in="highlight" dx="-0.8" dy="-1" result="hiOffset" />
      <feMerge>
        <feMergeNode in="shadowOffset" />
        <feMergeNode in="hiOffset" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <rect width="520" height="325" rx="14" fill="url(#${bgDiag})" />
  <path d="M0,0 L220,0 L200,275 L0,275 Z" fill="${VEGALTA_COLORS.deepBlue}" opacity="0.92" />
  <circle cx="108" cy="138" r="82" fill="none" stroke="${VEGALTA_COLORS.goldLight}" stroke-width="1" opacity="0.35" />
  <image href="${escapeXml(logoHref)}" x="34" y="58" width="148" height="136" preserveAspectRatio="xMidYMid meet" />
  <text x="340" y="128" text-anchor="middle" fill="${VEGALTA_COLORS.royalBlue}" font-size="52" font-weight="900" font-family="Georgia, 'Times New Roman', serif" letter-spacing="1" filter="url(#${vegaltStroke})">VEGALTA</text>
  <text x="340" y="158" text-anchor="middle" fill="${VEGALTA_COLORS.gold}" font-size="18" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="8">SENDAI</text>
  <text x="340" y="188" text-anchor="middle" fill="${VEGALTA_COLORS.royalBlue}" font-size="13" font-weight="600" font-family="Arial, sans-serif" letter-spacing="1">${escapeXml(displayName)}</text>
  <text x="490" y="248" text-anchor="end" fill="${VEGALTA_COLORS.royalBlue}" font-size="9" font-family="Arial, sans-serif" opacity="0.7">©1998 VEGALTA</text>
  <rect x="0" y="272" width="520" height="53" fill="${VEGALTA_COLORS.royalBlue}" />
  <line x1="0" y1="272" x2="520" y2="272" stroke="white" stroke-width="1.5" />
  <line x1="0" y1="274" x2="520" y2="274" stroke="white" stroke-width="0.5" opacity="0.5" />
  <text x="22" y="304" fill="white" font-size="13" font-weight="700" font-family="Arial, Helvetica, sans-serif" letter-spacing="3">${escapeXml(officialCardLabel)}</text>
  <path d="M468,272 L520,272 L520,325 L448,325 Z" fill="${VEGALTA_COLORS.red}" />
  <text x="452" y="305" text-anchor="end" fill="#8FA8C8" font-size="19" font-weight="700" font-family="'Courier New', 'Lucida Console', monospace" letter-spacing="5" filter="url(#${machineEngrave})">${escapeXml(engravedId)}</text>
</svg>`;
}
