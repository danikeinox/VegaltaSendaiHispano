"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/lib/scroll-to-section";

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    const timer = window.setTimeout(() => {
      scrollToSection(hash);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
