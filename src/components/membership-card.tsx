"use client";

import { VEGALTA_COLORS } from "@/lib/constants";

type MembershipCardProps = {
  displayId: string;
  firstName: string;
  lastName: string;
  className?: string;
};

export function MembershipCard({
  displayId,
  firstName,
  lastName,
  className = "",
}: MembershipCardProps) {
  const fullName = `${firstName} ${lastName}`.toUpperCase();

  return (
    <div className={`w-full max-w-[480px] ${className}`}>
      <svg
        viewBox="0 0 480 300"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto rounded-2xl shadow-2xl"
        role="img"
        aria-label={`Carnet digital ${displayId} de ${firstName} ${lastName}`}
      >
        <defs>
          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={VEGALTA_COLORS.deepBlue} />
            <stop offset="45%" stopColor="#123A6B" />
            <stop offset="70%" stopColor="#C9A000" />
            <stop offset="100%" stopColor={VEGALTA_COLORS.yellow} />
          </linearGradient>
          <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={VEGALTA_COLORS.gold} stopOpacity="0.4" />
            <stop offset="100%" stopColor={VEGALTA_COLORS.deepBlue} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fondo tarjeta */}
        <rect width="480" height="300" rx="16" fill="url(#cardGradient)" />

        {/* Panel izquierdo azul */}
        <rect x="0" y="0" width="200" height="300" rx="16" fill={VEGALTA_COLORS.deepBlue} />

        {/* Estrellas doradas alrededor del escudo */}
        {generateStars(100, 130, 70).map((star, i) => (
          <polygon
            key={i}
            points={starPoints(star.x, star.y, 5, 2.5)}
            fill={VEGALTA_COLORS.gold}
            opacity="0.9"
          />
        ))}

        {/* Escudo circular — águila/fénix estilizado */}
        <circle cx="100" cy="130" r="52" fill="url(#shieldGlow)" />
        <circle
          cx="100"
          cy="130"
          r="48"
          fill="none"
          stroke={VEGALTA_COLORS.gold}
          strokeWidth="2"
        />
        <circle cx="100" cy="130" r="42" fill="#0D2F55" stroke={VEGALTA_COLORS.red} strokeWidth="1.5" />

        {/* Fénix/águila simplificado */}
        <path
          d="M100 95 C85 110, 75 125, 80 145 C90 135, 95 150, 100 160 C105 150, 110 135, 120 145 C125 125, 115 110, 100 95Z"
          fill={VEGALTA_COLORS.gold}
        />
        <path
          d="M100 100 L95 125 L100 118 L105 125 Z"
          fill={VEGALTA_COLORS.red}
        />
        <ellipse cx="100" cy="148" rx="18" ry="8" fill={VEGALTA_COLORS.gold} opacity="0.6" />

        {/* Logo VEGALTA SENDAI */}
        <text
          x="280"
          y="110"
          textAnchor="middle"
          fill={VEGALTA_COLORS.deepBlue}
          fontSize="28"
          fontWeight="800"
          fontFamily="Arial Black, sans-serif"
          letterSpacing="2"
        >
          VEGALTA
        </text>
        <text
          x="280"
          y="140"
          textAnchor="middle"
          fill={VEGALTA_COLORS.deepBlue}
          fontSize="22"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
          letterSpacing="4"
        >
          SENDAI
        </text>

        {/* Nombre del socio */}
        <text
          x="280"
          y="175"
          textAnchor="middle"
          fill={VEGALTA_COLORS.deepBlue}
          fontSize="14"
          fontWeight="600"
          fontFamily="Arial, sans-serif"
        >
          {fullName.length > 28 ? `${fullName.slice(0, 25)}...` : fullName}
        </text>

        {/* Franja inferior */}
        <rect x="0" y="252" width="480" height="48" rx="0" fill={VEGALTA_COLORS.deepBlue} />
        <rect x="0" y="252" width="480" height="48" fill={VEGALTA_COLORS.deepBlue} clipPath="url(#bottomClip)" />
        <text
          x="24"
          y="282"
          fill={VEGALTA_COLORS.gold}
          fontSize="13"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
          letterSpacing="3"
        >
          OFFICIAL CARD
        </text>
        <text
          x="456"
          y="282"
          textAnchor="end"
          fill="white"
          fontSize="16"
          fontWeight="700"
          fontFamily="monospace"
        >
          {displayId}
        </text>

        {/* Acento rojo */}
        <rect x="200" y="0" width="4" height="252" fill={VEGALTA_COLORS.red} opacity="0.7" />
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
