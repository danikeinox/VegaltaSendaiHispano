import Image from "next/image";
import { HeroCtaBar } from "@/components/hero-cta-bar";
import { HeroMemberCounter } from "@/components/hero-member-counter";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { SectionNavLink } from "@/components/section-nav-link";

type HomeHeroProps = {
  locale: string;
};

export async function HomeHero({ locale: rawLocale }: HomeHeroProps) {
  if (!isValidLocale(rawLocale)) return null;

  const dict = await getDictionary(rawLocale);
  const homePath = localizedPath(rawLocale);

  return (
    <section className="relative flex min-h-[22rem] w-full items-start overflow-hidden sm:min-h-[calc(100dvh-11rem)] sm:items-center md:h-full md:min-h-0">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/hero/stadium.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="portal-hero-gradient absolute inset-0" aria-hidden />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-portal px-4 pb-4 pt-[calc(var(--header-height)+1rem)] sm:px-6 sm:pb-8 sm:pt-[calc(var(--header-height)+1.5rem)] md:pb-10 md:pt-[calc(var(--header-height)+2rem)]">
        <div className="max-w-2xl text-white md:pl-8 lg:pl-14 xl:pl-20">
          <h1 className="vegalta-brand-text text-[1.75rem] leading-[1.15] sm:text-5xl lg:text-6xl">
            {dict.hero.titleLine1}
            <span className="block">{dict.hero.titleLine2}</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-portal-primary-accent sm:mt-6 sm:text-base md:text-lg">
            {dict.hero.description}
          </p>
          <div className="mt-5 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <HeroCtaBar className="w-full sm:w-auto" />
            <SectionNavLink
              href={`${homePath}/sobre`}
              className="portal-label inline-flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm text-white transition-colors hover:bg-white/10 sm:w-auto sm:px-8"
            >
              {dict.hero.learnMore}
            </SectionNavLink>
          </div>
          <HeroMemberCounter
            locale={rawLocale}
            label={dict.hero.memberCounter.label}
            updatedNote={dict.hero.memberCounter.updatedNote}
            unavailable={dict.hero.memberCounter.unavailable}
          />
        </div>
      </div>
    </section>
  );
}
