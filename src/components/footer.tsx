"use client";

import { ClubLogo } from "@/components/club-logo";
import { SectionNavLink } from "@/components/section-nav-link";
import { useLocale } from "@/components/locale-provider";
import { TelegramJoinButton } from "@/components/telegram-join-button";
import { VegaltaLogo } from "@/components/vegalta-logo";
import { localizedPath } from "@/i18n/navigation";

export function Footer() {
  const { locale, dict } = useLocale();

  return (
    <footer className="w-full mt-auto">
      <div className="h-1 bg-gradient-to-r from-vegalta-gold via-vegalta-gold-light to-vegalta-gold" />

      <div className="bg-vegalta-royal-blue text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <ClubLogo size="sm" />
              <VegaltaLogo variant="light" size="sm" showSubtitle={false} />
            </div>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              {dict.footer.description}
            </p>
          </div>

          <div>
            <p className="vegalta-section-title text-xs text-vegalta-gold-light mb-3">
              {dict.footer.links}
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <SectionNavLink
                  href={localizedPath(locale)}
                  className="hover:text-vegalta-gold-light transition-colors"
                >
                  {dict.footer.home}
                </SectionNavLink>
              </li>
              <li>
                <SectionNavLink
                  href={`${localizedPath(locale)}/sobre`}
                  className="hover:text-vegalta-gold-light transition-colors"
                >
                  {dict.footer.about}
                </SectionNavLink>
              </li>
              <li>
                <SectionNavLink
                  href={`${localizedPath(locale)}#registro`}
                  className="hover:text-vegalta-gold-light transition-colors"
                >
                  {dict.footer.getCard}
                </SectionNavLink>
              </li>
              <li>
                <TelegramJoinButton variant="link" />
              </li>
              <li>
                <a
                  href="https://www.vegalta.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-vegalta-gold-light transition-colors"
                >
                  {dict.footer.officialWeb}
                </a>
              </li>
            </ul>
            <p className="mt-3 text-xs text-white/50">
              {dict.footer.telegramMembers}
            </p>
          </div>

          <div>
            <p className="vegalta-section-title text-xs text-vegalta-gold-light mb-3">
              {dict.footer.legal}
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              {dict.footer.legalText}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 text-center">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {dict.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
