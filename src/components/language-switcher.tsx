"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { switchLocalePath } from "@/i18n/navigation";
import { useLocale } from "@/components/locale-provider";
import { setLocaleCookieClient } from "@/lib/locale-cookie";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useLocale();
  const pathname = usePathname();

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="group"
      aria-label={dict.language.label}
    >
      {locales.map((targetLocale) => {
        const isActive = locale === targetLocale;
        const label =
          targetLocale === "es" ? dict.language.es : dict.language.jp;

        return (
          <Link
            key={targetLocale}
            href={switchLocalePath(pathname, targetLocale as Locale)}
            prefetch={false}
            onClick={() => setLocaleCookieClient(targetLocale as Locale)}
            className={cn(
              "vegalta-section-title px-2 py-1.5 text-[10px] sm:text-xs transition-colors whitespace-nowrap",
              isActive
                ? "rounded bg-portal-gold font-bold text-portal-gold-text"
                : "text-white/70 hover:bg-white/5 hover:text-portal-gold-light"
            )}
            aria-current={isActive ? "page" : undefined}
            lang={targetLocale === "jp" ? "ja" : targetLocale}
          >
            {targetLocale === "es" ? "ES" : "JP"}
            <span className="sr-only"> — {label}</span>
          </Link>
        );
      })}
    </div>
  );
}
