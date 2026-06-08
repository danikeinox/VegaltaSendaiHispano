"use client";

import { useLocale } from "@/components/locale-provider";

type VegaltaLogoProps = {
  variant?: "light" | "dark" | "card";
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
};

export function VegaltaLogo({
  variant = "light",
  size = "md",
  showSubtitle = true,
}: VegaltaLogoProps) {
  const { dict } = useLocale();

  const sizes = {
    sm: { main: "text-xl", sub: "text-[10px]", gap: "gap-0" },
    md: { main: "text-2xl sm:text-3xl", sub: "text-xs", gap: "gap-0.5" },
    lg: { main: "text-4xl sm:text-5xl", sub: "text-sm", gap: "gap-1" },
  };

  const colors = {
    light: {
      vegalt: "text-white",
      sendai: "text-vegalta-gold-light",
      stroke: "drop-shadow-[0_1px_0_rgba(255,255,255,0.3)]",
      sub: "text-white/70",
    },
    dark: {
      vegalt: "text-vegalta-royal-blue",
      sendai: "text-vegalta-gold",
      stroke: "drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]",
      sub: "text-vegalta-blue/60",
    },
    card: {
      vegalt: "text-vegalta-royal-blue",
      sendai: "text-vegalta-gold",
      stroke: "drop-shadow-[0_2px_0_white,0_-1px_0_white,1px_0_0_white,-1px_0_0_white]",
      sub: "text-vegalta-blue/50",
    },
  };

  const s = sizes[size];
  const c = colors[variant];

  return (
    <div className={`flex flex-col items-start ${s.gap}`}>
      <div className={`vegalta-brand-text leading-none ${s.main} ${c.vegalt} ${c.stroke}`}>
        VEGALTA
      </div>
      <div
        className={`vegalta-section-title font-medium tracking-[0.35em] ${s.sub} ${c.sendai}`}
      >
        SENDAI
      </div>
      {showSubtitle && (
        <p className={`text-[10px] tracking-widest uppercase mt-1 ${c.sub}`}>
          {dict.common.communitySubtitle}
        </p>
      )}
    </div>
  );
}
