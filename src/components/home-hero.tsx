import { HeroCommunityBar } from "@/components/hero-community-bar";
import { HeroCtaBar } from "@/components/hero-cta-bar";
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
    <section className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden pt-[var(--header-height)]">
      <div className="vegalta-official-hero-bg absolute inset-0" aria-hidden>
        <div className="vegalta-hero-flag-stripes" aria-hidden>
          <div className="vegalta-hero-flag-stripe vegalta-hero-flag-stripe--red" />
          <div className="vegalta-hero-flag-stripe vegalta-hero-flag-stripe--yellow" />
          <div className="vegalta-hero-flag-stripe vegalta-hero-flag-stripe--red" />
        </div>
        <div className="vegalta-hero-flag-overlay" aria-hidden />
      </div>

      {/* Watermark — centrado en móvil, lateral en desktop */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(72vw,320px)] w-[min(72vw,320px)] -translate-x-1/2 -translate-y-1/2 opacity-[0.1] md:left-0 md:top-1/2 md:h-[120%] md:w-[55%] md:max-w-xl md:translate-x-0 md:-translate-y-1/2 md:opacity-[0.15]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/branding/logo-hispano.svg"
          alt=""
          className="h-full w-full object-contain object-center md:object-left"
        />
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col justify-center overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:py-8">
        <div className="flex w-full flex-col items-center gap-6 md:items-stretch lg:grid lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-24">
          <div className="w-full min-w-0 text-center md:pl-32 md:text-left lg:pl-36 xl:pl-40">
            <div className="inline-flex max-w-full flex-col items-center md:items-start">
              <h1 className="flex flex-col leading-[0.92]">
                <span className="vegalta-brand-text text-[1.65rem] text-white drop-shadow-[0_2px_0_rgba(26,61,124,0.35),0_2px_12px_rgba(15,45,92,0.35)] min-[360px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {dict.hero.titleLine1}
                </span>
                <span className="vegalta-brand-text text-[1.65rem] text-white drop-shadow-[0_2px_0_rgba(26,61,124,0.35),0_2px_12px_rgba(15,45,92,0.35)] min-[360px]:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {dict.hero.titleLine2}
                </span>
              </h1>
            </div>
          </div>

          <div className="w-full min-w-0 max-w-md space-y-4 lg:pl-2 md:max-w-none md:space-y-5 xl:pl-4">
            <p className="text-center text-sm leading-relaxed text-vegalta-blue/90 sm:text-base md:text-left md:text-lg lg:text-xl">
              {dict.hero.description}
            </p>
            <HeroCtaBar />
          </div>
        </div>
      </div>

      <HeroCommunityBar
        communityLabel={dict.hero.communityBarLabel}
        membersText={dict.footer.telegramMembers}
        registerLabel={dict.hero.communityBarRegister}
        registerHref={`${homePath}#registro`}
        scrollAriaLabel={dict.hero.scrollToBenefits}
      />
    </section>
  );
}
