"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  normalizePath,
  parseSectionHref,
  scrollToSection,
  updateSectionHash,
} from "@/lib/scroll-to-section";
import { cn } from "@/lib/utils";

type SectionNavLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
};

export function SectionNavLink({
  href,
  children,
  className,
  onNavigate,
}: SectionNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { path, sectionId } = parseSectionHref(href);
  const isSamePage = normalizePath(pathname) === normalizePath(path);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onNavigate?.();

    if (isSamePage) {
      scrollToSection(sectionId);
      updateSectionHash(sectionId);
      return;
    }

    router.push(href);
  }

  return (
    <a href={href} onClick={handleClick} className={cn(className)}>
      {children}
    </a>
  );
}
