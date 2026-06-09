"use client";

import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { SectionNavLink } from "@/components/section-nav-link";
import { useLocale } from "@/components/locale-provider";
import { useActiveNav } from "@/hooks/use-active-nav";
import { localizedPath } from "@/i18n/navigation";
import { buildNavItems } from "@/lib/nav-items";

const navLinkClass =
  "portal-label text-xs text-portal-primary-accent/85 transition-colors hover:text-portal-gold-light xl:text-sm";

const navLinkActiveClass =
  "portal-label border-b-2 border-portal-gold-light pb-1 text-xs text-portal-gold-light xl:text-sm";

type HeaderProps = {
  overlay?: boolean;
};

export function Header({ overlay = false }: HeaderProps) {
  const { locale, dict } = useLocale();
  const homePath = localizedPath(locale);
  const activeNav = useActiveNav(homePath);
  const navItems = buildNavItems(homePath, dict);

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
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-portal-primary shadow-md"
      >
        <div className="mx-auto grid h-20 max-w-portal grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
          <div className="min-w-0 justify-self-start">
            <SectionNavLink href={homePath} className="block min-w-0">
              <span className="vegalta-brand-text block truncate text-base text-portal-gold-light sm:text-lg lg:text-xl">
                VEGALTA HISPANO
              </span>
              <span className="mt-0.5 block truncate text-[9px] font-medium tracking-[0.18em] text-portal-primary-accent/80 sm:text-[10px]">
                {dict.hero.tagline}
              </span>
            </SectionNavLink>
          </div>

          <nav
            className="hidden items-center justify-center gap-5 lg:flex xl:gap-7"
            aria-label="Main"
          >
            {navItems.map((item) => (
              <SectionNavLink
                key={item.id}
                href={item.href}
                className={
                  activeNav === item.id ? navLinkActiveClass : navLinkClass
                }
              >
                {item.label}
              </SectionNavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:flex" />
            <SectionNavLink
              href={`${homePath}#registro`}
              className="portal-label hidden rounded-full bg-portal-gold px-4 py-2 text-xs text-portal-gold-text shadow-sm transition-transform hover:scale-105 hover:bg-portal-gold-light md:inline-flex lg:px-5 lg:text-sm"
            >
              {dict.nav.getCard}
            </SectionNavLink>
            <MobileNav />
          </div>
        </div>
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
