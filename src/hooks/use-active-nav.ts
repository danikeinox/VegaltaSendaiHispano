"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { normalizePath } from "@/lib/scroll-to-section";

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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setVisibleSection(visible.target.id);
        }
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.15, 0.35, 0.55],
      }
    );

    for (const sectionId of HOME_SECTIONS) {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    }

    const handleScroll = () => {
      if (window.scrollY < 120) {
        setVisibleSection(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [normalizedPath, normalizedHome]);

  if (normalizedPath === `${normalizedHome}/sobre`) {
    return "about";
  }

  if (normalizedPath === normalizedHome) {
    if (hashSection) return hashSection;

    if (visibleSection === "registro") return "register";
    if (visibleSection === "himno") return "anthem";
    if (visibleSection === "comunidad") return "community";

    return "home";
  }

  return "home";
}
