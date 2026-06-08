"use client";

import { useEffect } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { ClubLogo } from "@/components/club-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { SectionNavLink } from "@/components/section-nav-link";
import { TelegramJoinButton } from "@/components/telegram-join-button";
import { useLocale } from "@/components/locale-provider";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/constants";
import { localizedPath } from "@/i18n/navigation";

const navLinkClass =
  "vegalta-section-title px-2 xl:px-3 py-1 text-[10px] xl:text-[11px] text-white/85 hover:text-vegalta-gold-light hover:bg-white/5 transition-colors whitespace-nowrap";

export function Header() {
  const { locale, dict } = useLocale();
  const homePath = localizedPath(locale);

  const navPrimary = [
    { href: homePath, label: dict.nav.home },
    { href: `${homePath}#registro`, label: dict.nav.register },
    { href: `${homePath}#beneficios`, label: dict.nav.benefits },
  ];

  const navSecondary = [{ href: `${homePath}/sobre`, label: dict.nav.about }];

  useEffect(() => {
    const header = document.getElementById("site-header");
    const spacer = document.getElementById("site-header-spacer");
    if (!header || !spacer) return;

    const syncHeaderHeight = () => {
      const height = header.offsetHeight;
      spacer.style.height = `${height}px`;
      document.documentElement.style.setProperty(
        "--header-scroll-offset",
        `${height + 12}px`
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        id="site-header"
        className="fixed top-0 left-0 right-0 z-50 w-full overflow-visible shadow-lg"
      >
        <div className="h-1 bg-gradient-to-r from-vegalta-gold via-vegalta-gold-light to-vegalta-gold" />

        <div className="bg-vegalta-royal-blue relative overflow-visible">
          <div className="flex items-center justify-between gap-2 pr-3 sm:pr-4">
            <div className="vegalta-nav-badge bg-vegalta-gold min-w-[11rem] sm:min-w-[14rem] px-4 sm:px-6 py-2 sm:py-2.5">
              <p className="vegalta-brand-text text-lg sm:text-xl leading-none text-vegalta-blue">
                VEGALTA
              </p>
              <p className="vegalta-section-title text-[9px] sm:text-[10px] tracking-[0.35em] text-vegalta-blue/80">
                SENDAI
              </p>
              <p className="vegalta-section-title mt-1 text-[8px] sm:text-[9px] tracking-[0.2em] text-vegalta-blue/70">
                {dict.hero.tagline}
              </p>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 py-2">
              <a
                href={TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dict.telegram.ariaLabel}
                className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-[#229ED9] hover:text-white"
              >
                <FaTelegramPlane className="text-base" aria-hidden />
              </a>
              <LanguageSwitcher />
              <div className="hidden lg:block">
                <TelegramJoinButton variant="nav" />
              </div>
              <SectionNavLink
                href={`${homePath}#registro`}
                className="vegalta-section-title lg:hidden bg-vegalta-gold px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-vegalta-blue sm:text-xs"
              >
                {dict.nav.register}
              </SectionNavLink>
              <MobileNav />
            </div>
          </div>

          <div className="container relative mx-auto px-4 pb-3 pt-1 sm:px-6 sm:pb-4">
            <SectionNavLink
              href={homePath}
              className="absolute bottom-0 left-3 z-20 translate-y-[38%] sm:left-5 sm:translate-y-[42%]"
            >
              <div className="rounded-full bg-white p-1 shadow-xl ring-[3px] ring-vegalta-gold/40 sm:p-1.5 sm:ring-4">
                <ClubLogo size="hero" priority />
              </div>
            </SectionNavLink>

            <nav
              className="hidden lg:flex flex-col items-end gap-0.5 pl-36 xl:pl-40"
              aria-label="Main"
            >
              <div className="flex flex-wrap justify-end gap-0.5">
                {navPrimary.map((item) => (
                  <SectionNavLink key={item.label} href={item.href} className={navLinkClass}>
                    {item.label}
                  </SectionNavLink>
                ))}
              </div>
              <div className="flex flex-wrap justify-end gap-0.5">
                {navSecondary.map((item) => (
                  <SectionNavLink key={item.label} href={item.href} className={navLinkClass}>
                    {item.label}
                  </SectionNavLink>
                ))}
              </div>
            </nav>
          </div>
        </div>

        <div className="h-0.5 bg-vegalta-gold" />
      </header>

      <div
        id="site-header-spacer"
        className="pointer-events-none shrink-0"
        style={{ height: "var(--header-scroll-offset)" }}
        aria-hidden="true"
      />
    </>
  );
}
