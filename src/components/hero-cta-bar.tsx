"use client";

import { TelegramJoinButton } from "@/components/telegram-join-button";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

const heroChipClass =
  "flex w-full min-h-10 items-center justify-center gap-2 px-3 py-2.5 text-[10px] vegalta-section-title font-bold leading-snug tracking-wide text-center sm:min-h-11 sm:flex-1 sm:px-4 sm:py-3 sm:text-xs";

export function HeroCtaBar() {
  const { dict } = useLocale();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2.5 sm:max-w-xl sm:flex-row sm:gap-3 md:max-w-none">
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
