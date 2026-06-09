import Image from "next/image";
import { HeroCtaBar } from "@/components/hero-cta-bar";
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
    <section className="relative flex h-full min-h-0 w-full items-center overflow-hidden">
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

      <div className="relative z-10 mx-auto w-full max-w-portal px-4 pb-8 pt-[calc(var(--header-height)+1.5rem)] sm:px-6 sm:pb-10 sm:pt-[calc(var(--header-height)+2rem)]">
        <div className="max-w-2xl pl-4 text-white sm:pl-8 md:pl-14 lg:pl-20 xl:pl-24">
          <h1 className="vegalta-brand-text text-3xl leading-[1.1] sm:text-5xl lg:text-6xl">
            {dict.hero.titleLine1}
            <span className="block">{dict.hero.titleLine2}</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-portal-primary-accent sm:text-lg">
            {dict.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <HeroCtaBar />
            <SectionNavLink
              href={`${homePath}/sobre`}
              className="portal-label inline-flex min-h-12 items-center justify-center rounded-lg border-2 border-white px-8 py-3 text-sm text-white transition-colors hover:bg-white/10"
            >
              {dict.hero.learnMore}
            </SectionNavLink>
          </div>
        </div>
      </div>
    </section>
  );
}
