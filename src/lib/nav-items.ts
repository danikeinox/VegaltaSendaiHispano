import type { Dictionary } from "@/i18n/types";
import type { NavItemId } from "@/hooks/use-active-nav";

export type NavItem = {
  id: NavItemId;
  href: string;
  label: string;
};

export function buildNavItems(
  homePath: string,
  dict: Dictionary
): NavItem[] {
  return [
    { id: "home", href: homePath, label: dict.nav.home },
    {
      id: "register",
      href: `${homePath}#registro`,
      label: dict.nav.register,
    },
    { id: "anthem", href: `${homePath}#himno`, label: dict.nav.anthem },
    { id: "about", href: `${homePath}/sobre`, label: dict.nav.about },
    {
      id: "community",
      href: `${homePath}#comunidad`,
      label: dict.nav.community,
    },
  ];
}
