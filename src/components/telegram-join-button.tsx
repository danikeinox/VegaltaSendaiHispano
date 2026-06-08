"use client";

import { FaTelegramPlane } from "react-icons/fa";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/constants";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

type TelegramJoinButtonProps = {
  variant?: "button" | "hero" | "nav" | "link";
  className?: string;
  onClick?: () => void;
};

export function TelegramJoinButton({
  variant = "button",
  className,
  onClick,
}: TelegramJoinButtonProps) {
  const { dict } = useLocale();

  const base =
    "inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vegalta-gold-light";

  const variants = {
    button:
      "vegalta-section-title bg-[#229ED9] hover:bg-[#1a8bc4] text-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold tracking-wider shadow-md hover:shadow-lg",
    hero: "",
    nav: "vegalta-section-title px-4 py-2 text-xs text-white/80 hover:text-[#6ec9f5] hover:bg-white/5",
    link: "text-sm text-white/70 hover:text-[#6ec9f5]",
  };

  const label =
    variant === "nav" ? dict.telegram.joinNav : dict.telegram.join;

  return (
    <a
      href={TELEGRAM_COMMUNITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(base, variants[variant], className)}
      aria-label={dict.telegram.ariaLabel}
    >
      <FaTelegramPlane className="text-base shrink-0" aria-hidden />
      {label}
    </a>
  );
}
