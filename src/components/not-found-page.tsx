import Link from "next/link";
import { FaHome, FaSearch } from "react-icons/fa";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { localizedPath } from "@/i18n/navigation";

type NotFoundPageProps = {
  dict: Dictionary;
  locale: Locale;
};

export function NotFoundPage({ dict, locale }: NotFoundPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-portal-primary/10">
            <FaSearch
              className="text-3xl text-portal-primary"
              aria-hidden
            />
          </div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-portal-gold-text">
            {dict.notFound.label}
          </p>
          <h1 className="mt-4 font-display text-7xl font-black leading-none text-portal-primary sm:text-8xl">
            404
          </h1>
          <p className="mt-6 text-base leading-relaxed text-portal-on-surface-variant">
            {dict.notFound.message}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={localizedPath(locale)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-portal-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-portal-gold-text transition-colors hover:bg-portal-gold-light"
            >
              <FaHome className="text-base" aria-hidden />
              {dict.notFound.backHome}
            </Link>
            <Link
              href={`${localizedPath(locale)}#registro`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-portal-outline-variant px-6 py-3 text-sm font-semibold text-portal-primary transition-colors hover:bg-portal-surface-container"
            >
              {dict.notFound.getCard}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
