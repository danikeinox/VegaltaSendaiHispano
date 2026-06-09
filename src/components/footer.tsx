"use client";

import type { ReactNode } from "react";
import { FaGithub, FaTelegramPlane } from "react-icons/fa";
import { SectionNavLink } from "@/components/section-nav-link";
import { useLocale } from "@/components/locale-provider";
import { GITHUB_REPO_URL } from "@/lib/site-links";
import { TELEGRAM_COMMUNITY_URL } from "@/lib/constants";
import { localizedPath } from "@/i18n/navigation";

function FooterLinkColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h4 className="portal-label mb-3 text-portal-gold-light sm:mb-4">
        {title}
      </h4>
      <ul className="grid grid-cols-1 gap-y-2 text-sm text-white/70 min-[420px]:grid-cols-2 min-[420px]:gap-x-3 lg:grid-cols-1 lg:gap-x-0 xl:grid-cols-2 xl:gap-x-4">
        {children}
      </ul>
    </div>
  );
}

export function Footer() {
  const { locale, dict } = useLocale();
  const homePath = localizedPath(locale);

  return (
    <footer className="mt-auto w-full border-t-4 border-portal-gold-light bg-portal-primary text-white">
      <div className="mx-auto grid max-w-portal grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:gap-8 sm:px-6 sm:py-10 lg:grid-cols-4 lg:gap-10 lg:py-12">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <span className="font-display text-xl font-bold text-portal-gold-light">
            VEGALTA HISPANO
          </span>
          <p className="max-w-sm text-xs leading-relaxed text-white/60">
            {dict.footer.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:col-span-2 sm:gap-8 lg:col-span-2 lg:grid-cols-2">
          <FooterLinkColumn title={dict.footer.links}>
            <li>
              <SectionNavLink
                href={homePath}
                className="block transition-colors hover:text-white"
              >
                {dict.footer.home}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}/sobre`}
                className="block transition-colors hover:text-white"
              >
                {dict.footer.about}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}#registro`}
                className="block transition-colors hover:text-white"
              >
                {dict.footer.getCard}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}#himno`}
                className="block transition-colors hover:text-white"
              >
                {dict.nav.anthem}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}/legal#aviso-legal`}
                className="block transition-colors hover:text-white"
              >
                {dict.footer.legalNotice}
              </SectionNavLink>
            </li>
            <li>
              <SectionNavLink
                href={`${homePath}/legal#privacidad`}
                className="block transition-colors hover:text-white"
              >
                {dict.footer.privacy}
              </SectionNavLink>
            </li>
            <li className="min-[420px]:col-span-2 lg:col-span-1 xl:col-span-2">
              <SectionNavLink
                href={`${homePath}/legal#cookies`}
                className="block transition-colors hover:text-white"
              >
                {dict.footer.cookies}
              </SectionNavLink>
            </li>
          </FooterLinkColumn>

          <FooterLinkColumn title={dict.footer.official}>
            <li>
              <a
                href="https://www.vegalta.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-white"
              >
                {dict.footer.officialWeb}
              </a>
            </li>
            <li>
              <a
                href="https://store.vegalta.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-white"
              >
                {dict.footer.store}
              </a>
            </li>
            <li>
              <a
                href="https://www.vegalta.co.jp/fanclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-white"
              >
                {dict.footer.fanclub}
              </a>
            </li>
            <li>
              <a
                href="https://www.vegalta.co.jp/ticket/"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-white"
              >
                {dict.footer.tickets}
              </a>
            </li>
          </FooterLinkColumn>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <h4 className="portal-label mb-3 text-portal-gold-light sm:mb-4">
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
          <p className="mt-3 max-w-xs text-xs text-white/50 sm:mt-4">
            {dict.footer.telegramMembers}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center sm:py-5">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} {dict.footer.copyright}
        </p>
        <p className="mx-auto mt-2 max-w-2xl px-4 text-[10px] leading-relaxed text-white/35">
          {dict.footer.legalText}
        </p>
      </div>
    </footer>
  );
}
