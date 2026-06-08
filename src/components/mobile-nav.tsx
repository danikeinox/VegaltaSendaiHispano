"use client";

import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useLocale } from "@/components/locale-provider";
import { SectionNavLink } from "@/components/section-nav-link";
import { TelegramJoinButton } from "@/components/telegram-join-button";
import { localizedPath } from "@/i18n/navigation";

export function MobileNav() {
  const { locale, dict } = useLocale();
  const [open, setOpen] = useState(false);
  const homePath = localizedPath(locale);

  const links = [
    { href: homePath, label: dict.nav.home },
    { href: `${homePath}#beneficios`, label: dict.nav.benefits },
    { href: `${homePath}#registro`, label: dict.nav.register },
    { href: `${homePath}/sobre`, label: dict.nav.about },
  ];

  function closeMenu() {
    setOpen(false);
  }

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center h-9 w-9 text-white/90 hover:text-vegalta-gold-light hover:bg-white/5 transition-colors"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
      >
        {open ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
      </button>

      {open && (
        <nav
          id="mobile-nav-panel"
          className="absolute left-0 right-0 top-full bg-vegalta-royal-blue border-b border-white/10 shadow-lg"
        >
          <ul className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((item) => (
              <li key={item.label}>
                <SectionNavLink
                  href={item.href}
                  onNavigate={closeMenu}
                  className="block vegalta-section-title px-3 py-3 text-sm text-white/85 hover:text-vegalta-gold-light hover:bg-white/5 transition-colors"
                >
                  {item.label}
                </SectionNavLink>
              </li>
            ))}
            <li className="pt-1">
              <TelegramJoinButton
                variant="button"
                className="w-full justify-center text-xs"
                onClick={closeMenu}
              />
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
