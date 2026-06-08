"use client";

import { VEGALTA_COLORS } from "@/lib/constants";

const LOGO_HREF = "/assets/branding/logo-hispano.svg";

type MembershipCardProps = {
  displayId: string;
  firstName: string;
  lastName: string;
  officialCardLabel?: string;
  className?: string;
};

export function MembershipCard({
  displayId,
  firstName,
  lastName,
  officialCardLabel = "CARNET FAN OFICIAL",
  className = "",
}: MembershipCardProps) {
  const fullName = `${firstName} ${lastName}`.toUpperCase();
  const engravedId = displayId.toUpperCase();

  return (
    <div className={`mx-auto w-full max-w-[min(100%,520px)] px-1 sm:px-0 ${className}`}>
      <svg
        viewBox="0 0 520 325"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full rounded-xl shadow-2xl ring-1 ring-black/10"
        role="img"
        aria-label={`Carnet digital ${displayId} de ${firstName} ${lastName}`}
      >
        <defs>
          <linearGradient id="bgDiag" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={VEGALTA_COLORS.deepBlue} />
            <stop offset="30%" stopColor={VEGALTA_COLORS.royalBlue} />
            <stop offset="50%" stopColor={VEGALTA_COLORS.red} />
            <stop offset="75%" stopColor="#E8B020" />
            <stop offset="100%" stopColor={VEGALTA_COLORS.goldLight} />
          </linearGradient>
          <filter id="vegaltStroke" x="-4%" y="-4%" width="108%" height="108%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="dilated" />
            <feFlood floodColor="white" result="white" />
            <feComposite in="white" in2="dilated" operator="in" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="machineEngrave" x="-30%" y="-30%" width="160%" height="160%">
            <feFlood floodColor="#000000" floodOpacity="0.65" result="shadowColor" />
            <feComposite in="shadowColor" in2="SourceAlpha" operator="in" result="shadow" />
            <feOffset in="shadow" dx="1.2" dy="1.4" result="shadowOffset" />
            <feFlood floodColor="#ffffff" floodOpacity="0.22" result="hiColor" />
            <feComposite in="hiColor" in2="SourceAlpha" operator="in" result="highlight" />
            <feOffset in="highlight" dx="-0.8" dy="-1" result="hiOffset" />
            <feMerge>
              <feMergeNode in="shadowOffset" />
              <feMergeNode in="hiOffset" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="520" height="325" rx="14" fill="url(#bgDiag)" />

        <path
          d="M0,0 L220,0 L200,275 L0,275 Z"
          fill={VEGALTA_COLORS.deepBlue}
          opacity="0.92"
        />

        <circle
          cx="108"
          cy="138"
          r="82"
          fill="none"
          stroke={VEGALTA_COLORS.goldLight}
          strokeWidth="1"
          opacity="0.35"
        />

        <image
          href={LOGO_HREF}
          x="34"
          y="58"
          width="148"
          height="136"
          preserveAspectRatio="xMidYMid meet"
        />

        <text
          x="340"
          y="128"
          textAnchor="middle"
          fill={VEGALTA_COLORS.royalBlue}
          fontSize="52"
          fontWeight="900"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1"
          filter="url(#vegaltStroke)"
        >
          VEGALTA
        </text>

        <text
          x="340"
          y="158"
          textAnchor="middle"
          fill={VEGALTA_COLORS.gold}
          fontSize="18"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="8"
        >
          SENDAI
        </text>

        <text
          x="340"
          y="188"
          textAnchor="middle"
          fill={VEGALTA_COLORS.royalBlue}
          fontSize="13"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
          letterSpacing="1"
        >
          {fullName.length > 26 ? `${fullName.slice(0, 23)}...` : fullName}
        </text>

        <text
          x="490"
          y="248"
          textAnchor="end"
          fill={VEGALTA_COLORS.royalBlue}
          fontSize="9"
          fontFamily="Arial, sans-serif"
          opacity="0.7"
        >
          ©1998 VEGALTA
        </text>

        <rect x="0" y="272" width="520" height="53" fill={VEGALTA_COLORS.royalBlue} />
        <line x1="0" y1="272" x2="520" y2="272" stroke="white" strokeWidth="1.5" />
        <line x1="0" y1="274" x2="520" y2="274" stroke="white" strokeWidth="0.5" opacity="0.5" />

        <text
          x="22"
          y="304"
          fill="white"
          fontSize="13"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="3"
        >
          {officialCardLabel}
        </text>

        <path d="M468,272 L520,272 L520,325 L448,325 Z" fill={VEGALTA_COLORS.red} />

        <text
          x="452"
          y="305"
          textAnchor="end"
          fill="#8FA8C8"
          fontSize="19"
          fontWeight="700"
          fontFamily="'Courier New', 'Lucida Console', monospace"
          letterSpacing="5"
          filter="url(#machineEngrave)"
        >
          {engravedId}
        </text>
      </svg>
    </div>
  );
}
