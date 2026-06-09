"use client";

import { FaGithub, FaTelegramPlane } from "react-icons/fa";
import { useLocale } from "@/components/locale-provider";
import { GITHUB_REPO_URL } from "@/lib/site-links";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/constants";

export function CommunityCtaSection() {
  const { dict } = useLocale();

  return (
    <section id="comunidad" className="scroll-mt-[var(--header-scroll-offset)] bg-portal-primary py-12 text-white sm:py-16">
      <div className="mx-auto max-w-portal px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          {dict.communityCta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
          {dict.communityCta.subtitle}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <a
            href={TELEGRAM_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="portal-label inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#24A1DE] px-8 py-3 text-sm text-white transition-all hover:brightness-110"
          >
            <FaTelegramPlane className="text-lg" aria-hidden />
            {dict.communityCta.telegram}
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="portal-label inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-sm text-portal-primary transition-all hover:bg-portal-gold-light"
          >
            <FaGithub className="text-lg" aria-hidden />
            {dict.communityCta.github}
          </a>
        </div>
      </div>
    </section>
  );
}
