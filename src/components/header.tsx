"use client";

import { useEffect } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { ClubLogo } from "@/components/club-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { SectionNavLink } from "@/components/section-nav-link";
import { useLocale } from "@/components/locale-provider";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/constants";
import { localizedPath } from "@/i18n/navigation";

const navLinkClass =
  "vegalta-section-title px-2 xl:px-3 py-1.5 text-[10px] xl:text-[11px] text-white/85 hover:text-vegalta-gold-light hover:bg-white/5 transition-colors whitespace-nowrap";

type HeaderProps = {
  /** Home: header flota sobre el hero a pantalla completa (sin spacer). */
  overlay?: boolean;
};

export function Header({ overlay = false }: HeaderProps) {
  const { locale, dict } = useLocale();
  const homePath = localizedPath(locale);

  const navItems = [
    { href: homePath, label: dict.nav.home },
    { href: `${homePath}#registro`, label: dict.nav.register },
    { href: `${homePath}#beneficios`, label: dict.nav.benefits },
    { href: `${homePath}/sobre`, label: dict.nav.about },
  ];

  useEffect(() => {
    const header = document.getElementById("site-header");
    const spacer = document.getElementById("site-header-spacer");
    if (!header) return;

    const syncHeaderHeight = () => {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty("--header-height", `${height}px`);
      document.documentElement.style.setProperty(
        "--header-scroll-offset",
        `${height + 12}px`
      );
      if (spacer) {
        spacer.style.height = `${height}px`;
      }
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
          <div className="flex items-center justify-between gap-2 px-2 py-2 sm:px-4 sm:py-0">
            <div className="flex min-w-0 items-center gap-2">
              <SectionNavLink href={homePath} className="shrink-0 md:hidden">
                <ClubLogo
                  size="sm"
                  priority
                  className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
                />
              </SectionNavLink>

              <div className="vegalta-nav-badge min-w-0 bg-vegalta-gold px-2.5 py-1.5 sm:min-w-[10rem] sm:px-4 sm:py-2 md:min-w-[14rem] md:px-6 md:py-2.5">
                <p className="vegalta-brand-text text-sm leading-none text-vegalta-blue sm:text-lg md:text-xl">
                  VEGALTA
                </p>
                <p className="vegalta-section-title text-[7px] tracking-[0.3em] text-vegalta-blue/80 sm:text-[9px] md:text-[10px]">
                  SENDAI
                </p>
                <p className="vegalta-section-title mt-0.5 hidden text-[8px] tracking-[0.2em] text-vegalta-blue/70 md:mt-1 md:block md:text-[9px]">
                  {dict.hero.tagline}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <nav
                className="hidden min-w-0 items-center justify-end gap-0.5 xl:flex"
                aria-label="Main"
              >
                {navItems.map((item) => (
                  <SectionNavLink key={item.label} href={item.href} className={navLinkClass}>
                    {item.label}
                  </SectionNavLink>
                ))}
              </nav>

              <a
                href={TELEGRAM_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dict.telegram.ariaLabel}
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-[#229ED9] hover:text-white xl:inline-flex"
              >
                <FaTelegramPlane className="text-base" aria-hidden />
              </a>
              <LanguageSwitcher className="scale-90 sm:scale-100" />
              <MobileNav />
            </div>
          </div>

          <div className="pointer-events-none relative mx-auto hidden h-0 max-w-[1400px] px-3 sm:px-5 md:block">
            <SectionNavLink
              href={homePath}
              className="pointer-events-auto absolute bottom-0 left-3 z-20 translate-y-[42%] lg:left-5 lg:translate-y-[45%]"
            >
              <ClubLogo
                size="hero"
                priority
                className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
              />
            </SectionNavLink>
          </div>

          <div className="hidden h-3 md:block lg:h-4" aria-hidden />
        </div>

        <div className="h-0.5 bg-vegalta-gold" />
      </header>

      {!overlay && (
        <div
          id="site-header-spacer"
          className="pointer-events-none shrink-0"
          style={{ height: "var(--header-height)" }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
