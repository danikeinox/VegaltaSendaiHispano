"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getHeaderOffset, normalizePath } from "@/lib/scroll-to-section";

export type NavItemId =
  | "home"
  | "register"
  | "anthem"
  | "about"
  | "community";

const HOME_SECTIONS = ["registro", "himno", "comunidad"] as const;

function resolveFromHash(hash: string): NavItemId | null {
  if (hash === "registro") return "register";
  if (hash === "himno") return "anthem";
  if (hash === "comunidad") return "community";
  return null;
}

function resolveFromSection(sectionId: string | null): NavItemId | null {
  if (sectionId === "registro") return "register";
  if (sectionId === "himno") return "anthem";
  if (sectionId === "comunidad") return "community";
  return null;
}

function detectVisibleSection(): string | null {
  if (window.scrollY < 120) {
    return null;
  }

  const headerOffset = getHeaderOffset();
  const line = headerOffset + 48;
  const viewportBottom = window.innerHeight;
  const scrollBottom = window.scrollY + viewportBottom;
  const pageBottom = document.documentElement.scrollHeight;
  const hash = window.location.hash.replace("#", "");

  if (HOME_SECTIONS.includes(hash as (typeof HOME_SECTIONS)[number])) {
    const hashTarget = document.getElementById(hash);
    if (hashTarget) {
      const top = hashTarget.getBoundingClientRect().top;
      if (Math.abs(top - headerOffset) < 40) {
        return hash;
      }
    }
  }

  if (pageBottom - scrollBottom < 120) {
    return HOME_SECTIONS[HOME_SECTIONS.length - 1];
  }

  for (const sectionId of HOME_SECTIONS) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    const { top, bottom } = element.getBoundingClientRect();
    if (top <= line && bottom > line) {
      return sectionId;
    }
  }

  let bestId: string | null = null;
  let bestVisible = 0;

  for (const sectionId of HOME_SECTIONS) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    const { top, bottom } = element.getBoundingClientRect();
    const visible =
      Math.min(bottom, viewportBottom) - Math.max(top, line);

    if (visible > bestVisible) {
      bestVisible = visible;
      bestId = sectionId;
    }
  }

  if (bestId) {
    return bestId;
  }

  let activeId: string | null = null;

  for (const sectionId of HOME_SECTIONS) {
    const element = document.getElementById(sectionId);
    if (!element) continue;

    if (element.getBoundingClientRect().top <= line) {
      activeId = sectionId;
    }
  }

  return activeId;
}

export function useActiveNav(homePath: string): NavItemId {
  const pathname = usePathname();
  const normalizedPath = normalizePath(pathname);
  const normalizedHome = normalizePath(homePath);
  const [hashSection, setHashSection] = useState<NavItemId | null>(null);
  const [visibleSection, setVisibleSection] = useState<string | null>(null);

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace("#", "");
      setHashSection(resolveFromHash(hash));
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    if (normalizedPath !== normalizedHome) {
      setVisibleSection(null);
      return;
    }

    const updateActiveFromScroll = () => {
      setVisibleSection(detectVisibleSection());
    };

    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);

    return () => {
      window.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [normalizedPath, normalizedHome]);

  if (normalizedPath === `${normalizedHome}/sobre`) {
    return "about";
  }

  if (normalizedPath === normalizedHome) {
    const fromScroll = resolveFromSection(visibleSection);
    if (fromScroll) return fromScroll;
    if (hashSection) return hashSection;
    return "home";
  }

  return "home";
}
