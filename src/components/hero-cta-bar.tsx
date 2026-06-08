"use client";

import { TelegramJoinButton } from "@/components/telegram-join-button";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

const heroChipClass =
  "flex flex-1 items-center justify-center gap-2 min-h-11 px-4 py-3 text-xs vegalta-section-title font-bold tracking-wide text-center";

export function HeroCtaBar() {
  const { dict } = useLocale();

  return (
    <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3 w-full max-w-xl mx-auto px-1">
      <TelegramJoinButton
        variant="hero"
        className={cn(
          heroChipClass,
          "bg-[#229ED9] hover:bg-[#1a8bc4] text-white transition-colors"
        )}
      />
      <div className={cn(heroChipClass, "bg-vegalta-red/90 text-white")}>
        {dict.hero.unofficial}
      </div>
    </div>
  );
}
