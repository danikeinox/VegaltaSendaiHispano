"use client";

import { FaGithub, FaTelegramPlane } from "react-icons/fa";
import { SectionNavLink } from "@/components/section-nav-link";
import { useLocale } from "@/components/locale-provider";
import { GITHUB_REPO_URL } from "@/lib/site-links";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/constants";
import { localizedPath } from "@/i18n/navigation";

export function Footer() {
  const { locale, dict } = useLocale();
  const homePath = localizedPath(locale);

  return (
    <footer className="mt-auto w-full border-t-4 border-portal-gold-light bg-portal-primary text-white">
      <div className="mx-auto grid max-w-portal grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-10 lg:py-12">
        <div className="space-y-4">
          <span className="font-display text-xl font-bold text-portal-gold-light">
            VEGALTA HISPANO
          </span>
          <p className="text-xs leading-relaxed text-white/60">
            {dict.footer.description}
          </p>
        </div>

        <div>
          <h4 className="portal-label mb-4 text-portal-gold-light">
            {dict.footer.links}
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <SectionNavLink
                href={homePath}
                className="transition-colors hover:text-white"
              >
                {dict.footer.home}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}/sobre`}
                className="transition-colors hover:text-white"
              >
                {dict.footer.about}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}#registro`}
                className="transition-colors hover:text-white"
              >
                {dict.footer.getCard}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}#himno`}
                className="transition-colors hover:text-white"
              >
                {dict.nav.anthem}
              </SectionNavLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="portal-label mb-4 text-portal-gold-light">
            {dict.footer.official}
          </h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <a
                href="https://www.vegalta.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {dict.footer.officialWeb}
              </a>
            </li>
            <li>
              <a
                href="https://store.vegalta.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {dict.footer.store}
              </a>
            </li>
            <li>
              <a
                href="https://www.vegalta.co.jp/fanclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {dict.footer.fanclub}
              </a>
            </li>
            <li>
              <a
                href="https://www.vegalta.co.jp/ticket/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {dict.footer.tickets}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="portal-label mb-4 text-portal-gold-light">
            {dict.footer.social}
          </h4>
          <div className="flex gap-3">
            <a
              href={TELEGRAM_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.telegram.ariaLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <FaTelegramPlane aria-hidden />
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={dict.footer.github}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <FaGithub aria-hidden />
            </a>
          </div>
          <p className="mt-4 text-xs text-white/50">{dict.footer.telegramMembers}</p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} {dict.footer.copyright}
        </p>
        <p className="mt-2 px-4 text-[10px] leading-relaxed text-white/35">
          {dict.footer.legalText}
        </p>
      </div>
    </footer>
  );
}
