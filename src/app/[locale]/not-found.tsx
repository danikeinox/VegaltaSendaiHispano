"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { localizedPath } from "@/i18n/navigation";

export default function LocaleNotFound() {
  const { locale, dict } = useLocale();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center vegalta-hero-gradient text-white gap-6 px-4">
      <p className="vegalta-section-title text-vegalta-gold-light text-sm tracking-[0.3em]">
        {dict.notFound.label}
      </p>
      <h1 className="vegalta-brand-text text-8xl leading-none">404</h1>
      <p className="text-white/70 text-center max-w-md">{dict.notFound.message}</p>
      <Link
        href={localizedPath(locale)}
        className="px-8 py-3 bg-vegalta-gold text-vegalta-blue vegalta-section-title text-sm font-bold tracking-widest hover:bg-vegalta-gold-light transition-colors"
      >
        {dict.notFound.backHome}
      </Link>
    </div>
  );
}
