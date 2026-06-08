import { HeroCtaBar } from "@/components/hero-cta-bar";
import { SectionNavLink } from "@/components/section-nav-link";
import { TelegramJoinButton } from "@/components/telegram-join-button";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";

type HomeHeroProps = {
  locale: string;
};

export async function HomeHero({ locale: rawLocale }: HomeHeroProps) {
  if (!isValidLocale(rawLocale)) return null;

  const dict = await getDictionary(rawLocale);
  const homePath = localizedPath(rawLocale);

  return (
    <section className="relative overflow-hidden">
      <div className="vegalta-official-hero-bg absolute inset-0" aria-hidden />

      <div
        className="pointer-events-none absolute -left-8 top-1/2 h-[120%] w-[55%] max-w-xl -translate-y-1/2 opacity-[0.12] sm:opacity-[0.15]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/branding/logo-hispano.svg"
          alt=""
          className="h-full w-full object-contain object-left"
        />
      </div>

      <div className="relative container mx-auto px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 md:pb-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="pl-24 sm:pl-32 md:pl-36 lg:pl-40">
            <p className="vegalta-section-title mb-2 text-[10px] tracking-[0.25em] text-vegalta-blue/70 sm:text-xs">
              {dict.hero.taglineSecondary}
            </p>
            <h1 className="vegalta-brand-text text-[3.5rem] leading-[0.9] text-white drop-shadow-[0_3px_0_rgba(26,61,124,0.35)] sm:text-7xl md:text-8xl">
              {dict.hero.displayTitle}
            </h1>
            <p className="vegalta-section-title mt-3 text-xs tracking-[0.3em] text-vegalta-blue/75 sm:text-sm">
              VEGALTA SENDAI
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <p className="max-w-lg text-base leading-relaxed text-vegalta-blue/90 sm:text-lg">
              {dict.hero.description}
            </p>
            <HeroCtaBar />
          </div>
        </div>
      </div>

      <div className="relative border-t-2 border-vegalta-gold bg-vegalta-royal-blue">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <p className="vegalta-section-title text-[10px] tracking-[0.3em] text-vegalta-gold-light sm:text-xs">
              {dict.hero.communityBarLabel}
            </p>
            <p className="mt-1 text-sm text-white/75 sm:text-base">
              {dict.footer.telegramMembers}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SectionNavLink
              href={`${homePath}#registro`}
              className="vegalta-section-title inline-flex min-h-11 items-center justify-center bg-vegalta-gold px-5 py-2.5 text-xs font-bold tracking-wide text-vegalta-blue transition-opacity hover:opacity-90"
            >
              {dict.hero.communityBarRegister}
            </SectionNavLink>
            <TelegramJoinButton
              variant="button"
              className="min-h-11 justify-center text-xs"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
