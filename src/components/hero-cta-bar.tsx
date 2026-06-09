"use client";

import { TelegramJoinButton } from "@/components/telegram-join-button";
import { cn } from "@/lib/utils";

type HeroCtaBarProps = {
  className?: string;
};

export function HeroCtaBar({ className }: HeroCtaBarProps) {
  return (
    <TelegramJoinButton
      variant="hero"
      className={cn(
        "portal-label inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-portal-gold px-6 py-3 text-sm font-bold text-portal-gold-text shadow-sm transition-transform hover:scale-105 hover:bg-portal-gold-light sm:px-8",
        className
      )}
    />
  );
}
