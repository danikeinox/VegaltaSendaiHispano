"use client";

import { VEGALTA_COLORS } from "@/lib/constants";

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
  officialCardLabel = "CARNET OFICIAL",
  className = "",
}: MembershipCardProps) {
  const fullName = `${firstName} ${lastName}`.toUpperCase();

  return (
    <div className={`w-full max-w-[520px] px-2 sm:px-0 ${className}`}>
      <svg
        viewBox="0 0 520 325"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-black/10"
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
        </defs>

        {/* Fondo diagonal como tarjeta física */}
        <rect width="520" height="325" rx="14" fill="url(#bgDiag)" />

        {/* Panel izquierdo azul sólido */}
        <path
          d="M0,0 L220,0 L200,275 L0,275 Z"
          fill={VEGALTA_COLORS.deepBlue}
          opacity="0.92"
        />

        {/* 12 estrellas doradas */}
        {generateStars(108, 148, 78).map((star, i) => (
          <polygon
            key={i}
            points={starPoints(star.x, star.y, 6, 3)}
            fill={VEGALTA_COLORS.goldLight}
          />
        ))}

        {/* Escudo */}
        <circle cx="108" cy="148" r="54" fill="none" stroke={VEGALTA_COLORS.goldLight} strokeWidth="1.5" />
        <circle cx="108" cy="148" r="48" fill={VEGALTA_COLORS.royalBlue} stroke={VEGALTA_COLORS.red} strokeWidth="2" />

        {/* Águila / fénix estilizado */}
        <path
          d="M108 108 C90 125, 82 142, 88 162 C98 150, 102 168, 108 178 C114 168, 118 150, 128 162 C134 142, 126 125, 108 108Z"
          fill={VEGALTA_COLORS.goldLight}
        />
        <path d="M108 114 L102 140 L108 132 L114 140 Z" fill={VEGALTA_COLORS.red} />
        <path
          d="M88 155 Q108 172 128 155"
          fill="none"
          stroke={VEGALTA_COLORS.gold}
          strokeWidth="2"
        />
        <text x="108" y="168" textAnchor="middle" fill={VEGALTA_COLORS.deepBlue} fontSize="5" fontWeight="700" fontFamily="Arial,sans-serif">
          VEGALTA
        </text>
        <text x="108" y="174" textAnchor="middle" fill={VEGALTA_COLORS.deepBlue} fontSize="4" fontFamily="Arial,sans-serif">
          SENDAI
        </text>

        {/* VEGALTA con contorno blanco */}
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

        {/* SENDAI en dorado */}
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

        {/* Nombre del socio */}
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

        {/* ©1998 VEGALTA */}
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

        {/* Franja inferior azul con líneas blancas */}
        <rect x="0" y="272" width="520" height="53" fill={VEGALTA_COLORS.royalBlue} />
        <line x1="0" y1="272" x2="520" y2="272" stroke="white" strokeWidth="1.5" />
        <line x1="0" y1="274" x2="520" y2="274" stroke="white" strokeWidth="0.5" opacity="0.5" />
        <line x1="0" y1="323" x2="520" y2="323" stroke="white" strokeWidth="1" opacity="0.6" />

        <text
          x="22"
          y="304"
          fill="white"
          fontSize="14"
          fontWeight="700"
          fontFamily="Arial, Helvetica, sans-serif"
          letterSpacing="4"
        >
          {officialCardLabel}
        </text>

        <text
          x="498"
          y="304"
          textAnchor="end"
          fill={VEGALTA_COLORS.goldLight}
          fontSize="17"
          fontWeight="700"
          fontFamily="'Courier New', monospace"
          letterSpacing="1"
        >
          {displayId}
        </text>

        {/* Esquina roja inferior derecha */}
        <path d="M480,272 L520,272 L520,325 L460,325 Z" fill={VEGALTA_COLORS.red} opacity="0.85" />
      </svg>
    </div>
  );
}

function generateStars(cx: number, cy: number, radius: number) {
  const stars = [];
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    stars.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  }
  return stars;
}

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    points.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return points.join(" ");
}
