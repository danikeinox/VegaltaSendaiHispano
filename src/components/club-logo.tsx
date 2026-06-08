"use client";

import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

type ClubLogoProps = {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  priority?: boolean;
};

const sizes = {
  sm: "h-9 w-9 sm:h-11 sm:w-11",
  md: "h-14 w-14 sm:h-16 sm:w-16",
  lg: "h-20 w-20 sm:h-24 sm:w-24",
  xl: "h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36",
  hero: "h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32",
};

export function ClubLogo({
  size = "md",
  className,
  priority = false,
}: ClubLogoProps) {
  const { dict } = useLocale();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/branding/logo-hispano.svg"
      alt={dict.common.logoAlt}
      width={139}
      height={127}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn(sizes[size], "object-contain drop-shadow-md", className)}
    />
  );
}
