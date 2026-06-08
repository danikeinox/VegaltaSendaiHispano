"use client";

import { SiBuymeacoffee } from "react-icons/si";
import { getBuyMeACoffeeUrl } from "@/lib/support";

type BuyMeCoffeeButtonProps = {
  label: string;
  ariaLabel: string;
  className?: string;
};

export function BuyMeCoffeeButton({
  label,
  ariaLabel,
  className = "",
}: BuyMeCoffeeButtonProps) {
  const url = getBuyMeACoffeeUrl();
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#FFDD00] px-5 py-2.5 text-sm font-bold text-[#1a1a1a] shadow-sm transition-opacity hover:opacity-90 ${className}`}
    >
      <SiBuymeacoffee className="shrink-0 text-xl" aria-hidden />
      <span>{label}</span>
    </a>
  );
}
