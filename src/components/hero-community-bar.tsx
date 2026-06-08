"use client";

import { FaChevronDown } from "react-icons/fa";
import { SectionNavLink } from "@/components/section-nav-link";
import { scrollToSection, updateSectionHash } from "@/lib/scroll-to-section";

type HeroCommunityBarProps = {
  communityLabel: string;
  membersText: string;
  registerLabel: string;
  registerHref: string;
  scrollAriaLabel: string;
};

export function HeroCommunityBar({
  communityLabel,
  membersText,
  registerLabel,
  registerHref,
  scrollAriaLabel,
}: HeroCommunityBarProps) {
  function scrollToBenefits() {
    scrollToSection("beneficios");
    updateSectionHash("beneficios");
  }

  const arrowButton = (
    <button
      type="button"
      onClick={scrollToBenefits}
      aria-label={scrollAriaLabel}
      className="group inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white/80 transition-colors hover:border-vegalta-gold-light hover:bg-white/10 hover:text-vegalta-gold-light md:h-11 md:w-11"
    >
      <FaChevronDown
        className="text-base transition-transform group-hover:translate-y-0.5 md:text-lg"
        aria-hidden
      />
    </button>
  );

  return (
    <div className="relative mt-auto shrink-0 border-t-2 border-vegalta-gold bg-vegalta-royal-blue">
      <div className="mx-auto max-w-[1400px] px-4 py-3 md:container md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-4 md:px-6 md:py-5">
        <div className="min-w-0 text-center md:text-left md:justify-self-start">
          <p className="vegalta-section-title text-[9px] tracking-[0.28em] text-vegalta-gold-light md:text-xs">
            {communityLabel}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-white/75 md:mt-1 md:text-sm lg:text-base">
            {membersText}
          </p>
        </div>

        <div className="mt-2.5 flex items-center justify-center gap-2.5 md:mt-0 md:contents">
          <div className="md:justify-self-center">{arrowButton}</div>

          <SectionNavLink
            href={registerHref}
            className="vegalta-section-title inline-flex min-h-10 flex-1 items-center justify-center bg-vegalta-gold px-3 py-2 text-[10px] font-bold leading-tight tracking-wide text-vegalta-blue transition-opacity hover:opacity-90 min-[400px]:px-4 md:min-h-11 md:flex-none md:justify-self-end md:px-6 md:py-2.5 md:text-xs lg:text-sm"
          >
            {registerLabel}
          </SectionNavLink>
        </div>
      </div>
    </div>
  );
}
