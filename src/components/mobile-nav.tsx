"use client";

import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useLocale } from "@/components/locale-provider";
import { SectionNavLink } from "@/components/section-nav-link";
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
    <div className="relative shrink-0 xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center text-white/90 transition-colors hover:bg-white/5 hover:text-vegalta-gold-light"
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
            className="fixed left-0 right-0 top-[var(--header-height)] z-50 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-b border-white/10 bg-vegalta-royal-blue shadow-lg"
          >
            <ul className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {links.map((item) => (
                <li key={item.label}>
                  <SectionNavLink
                    href={item.href}
                    onNavigate={closeMenu}
                    className="block vegalta-section-title px-3 py-3 text-sm text-white/85 transition-colors hover:bg-white/5 hover:text-vegalta-gold-light"
                  >
                    {item.label}
                  </SectionNavLink>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
