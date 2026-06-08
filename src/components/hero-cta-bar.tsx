"use client";

import { TelegramJoinButton } from "@/components/telegram-join-button";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

const heroChipClass =
  "flex flex-1 items-center justify-center gap-2 min-h-11 px-4 py-3 text-xs vegalta-section-title font-bold tracking-wide text-center";

export function HeroCtaBar() {
  const { dict } = useLocale();

  return (
    <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 px-1 sm:flex-row">
      <TelegramJoinButton
        variant="hero"
        className={cn(
          heroChipClass,
          "bg-[#229ED9] text-white transition-colors hover:bg-[#1a8bc4]"
        )}
      />
      <div
        className={cn(
          heroChipClass,
          "border border-vegalta-blue/20 bg-white/70 text-vegalta-blue backdrop-blur-sm"
        )}
      >
        {dict.hero.unofficial}
      </div>
    </div>
  );
}
