"use client";

import { useEffect } from "react";
import { ClubLogo } from "@/components/club-logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { SectionNavLink } from "@/components/section-nav-link";
import { TelegramJoinButton } from "@/components/telegram-join-button";
import { useLocale } from "@/components/locale-provider";
import { VegaltaLogo } from "@/components/vegalta-logo";
import { localizedPath } from "@/i18n/navigation";

export function Header() {
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
        className="fixed top-0 left-0 right-0 z-50 w-full shadow-md"
      >
        <div className="h-1 bg-gradient-to-r from-vegalta-gold via-vegalta-gold-light to-vegalta-gold" />

        <div className="bg-vegalta-royal-blue border-b border-white/10 relative">
          <div className="container mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <SectionNavLink
            href={homePath}
            className="flex items-center gap-2 sm:gap-3 min-w-0 shrink"
          >
            <ClubLogo size="sm" priority />
            <span className="hidden sm:block min-w-0">
              <VegaltaLogo variant="light" size="sm" showSubtitle={false} />
            </span>
          </SectionNavLink>

          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navItems.map((item) => (
              <SectionNavLink
                key={item.label}
                href={item.href}
                className="vegalta-section-title px-3 xl:px-4 py-2 text-xs text-white/80 hover:text-vegalta-gold-light hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                {item.label}
              </SectionNavLink>
            ))}
            <TelegramJoinButton variant="nav" />
            <LanguageSwitcher className="ml-1" />
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 lg:hidden shrink-0">
            <LanguageSwitcher />
            <SectionNavLink
              href={`${homePath}#registro`}
              className="vegalta-section-title text-[10px] sm:text-xs bg-vegalta-gold text-vegalta-blue px-2.5 sm:px-3 py-1.5 font-bold whitespace-nowrap"
            >
              {dict.nav.register}
            </SectionNavLink>
            <MobileNav />
          </div>
          </div>
        </div>
      </header>
      <div
        id="site-header-spacer"
        className="shrink-0 pointer-events-none"
        style={{ height: "var(--header-scroll-offset)" }}
        aria-hidden="true"
      />
    </>
  );
}
