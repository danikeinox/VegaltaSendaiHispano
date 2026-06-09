"use client";

import { TelegramJoinButton } from "@/components/telegram-join-button";

export function HeroCtaBar() {
  return (
    <TelegramJoinButton
      variant="hero"
      className="portal-label inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-portal-gold px-8 py-3 text-sm font-bold text-portal-gold-text shadow-sm transition-transform hover:scale-105 hover:bg-portal-gold-light"
    />
  );
}
