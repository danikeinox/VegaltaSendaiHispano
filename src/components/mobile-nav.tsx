"use client";

import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useLocale } from "@/components/locale-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SectionNavLink } from "@/components/section-nav-link";
import { localizedPath } from "@/i18n/navigation";
import { useActiveNav } from "@/hooks/use-active-nav";
import { buildNavItems } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { locale, dict } = useLocale();
  const [open, setOpen] = useState(false);
  const homePath = localizedPath(locale);
  const activeNav = useActiveNav(homePath);
  const links = buildNavItems(homePath, dict);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative shrink-0 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center text-white/90 transition-colors hover:text-portal-gold-light"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
      >
        {open ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[var(--header-height)] z-40 bg-black/40"
            aria-label={dict.nav.closeMenu}
            onClick={closeMenu}
          />
          <nav
            id="mobile-nav-panel"
            className="fixed left-0 right-0 top-[var(--header-height)] z-50 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-b border-white/10 bg-portal-primary shadow-lg"
          >
            <ul className="mx-auto flex max-w-portal flex-col gap-1 px-4 py-3">
              {links.map((item) => (
                <li key={item.id}>
                  <SectionNavLink
                    href={item.href}
                    onNavigate={closeMenu}
                    className={cn(
                      "portal-label block px-3 py-3 text-sm transition-colors hover:bg-white/5",
                      activeNav === item.id
                        ? "bg-white/5 text-portal-gold-light"
                        : "text-white/85 hover:text-portal-gold-light"
                    )}
                  >
                    {item.label}
                  </SectionNavLink>
                </li>
              ))}
              <li className="px-3 py-2">
                <LanguageSwitcher />
              </li>
              <li className="px-3 py-2">
                <SectionNavLink
                  href={`${homePath}#registro`}
                  onNavigate={closeMenu}
                  className="portal-label inline-flex w-full items-center justify-center rounded-full bg-portal-gold px-5 py-3 text-sm text-portal-gold-text"
                >
                  {dict.nav.getCard}
                </SectionNavLink>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
