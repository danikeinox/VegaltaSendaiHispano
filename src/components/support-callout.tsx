"use client";

import { BuyMeCoffeeButton } from "@/components/buy-me-coffee-button";
import { useLocale } from "@/components/locale-provider";
import { isSupportConfigured } from "@/lib/support";

type SupportCalloutProps = {
  showAppleNote?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

export function SupportCallout({
  showAppleNote = false,
  variant = "light",
  className = "",
}: SupportCalloutProps) {
  const { dict } = useLocale();

  if (!isSupportConfigured()) return null;

  const isDark = variant === "dark";

  return (
    <aside
      className={`w-full max-w-md rounded-sm border px-4 py-4 text-center sm:px-5 ${
        isDark
          ? "border-white/15 bg-white/5"
          : "border-vegalta-gold/30 bg-vegalta-gold/5"
      } ${className}`}
    >
      <p
        className={`vegalta-section-title text-xs font-bold tracking-wide ${
          isDark ? "text-vegalta-gold-light" : "text-vegalta-royal-blue"
        }`}
      >
        {dict.support.title}
      </p>
      <p
        className={`mt-2 text-xs leading-relaxed ${
          isDark ? "text-white/70" : "text-vegalta-blue/75"
        }`}
      >
        {dict.support.description}
      </p>
      {showAppleNote && (
        <p
          className={`mt-2 text-xs leading-relaxed ${
            isDark ? "text-white/55" : "text-vegalta-blue/65"
          }`}
        >
          {dict.support.appleNote}
        </p>
      )}
      <div className="mt-4 flex justify-center">
        <BuyMeCoffeeButton
          label={dict.support.button}
          ariaLabel={dict.support.ariaLabel}
        />
      </div>
    </aside>
  );
}
