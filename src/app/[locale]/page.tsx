import { AnthemSection } from "@/components/anthem-section";
import { CommunityCtaSection } from "@/components/community-cta-section";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Header } from "@/components/header";
import { HeroLogoBridge } from "@/components/hero-logo-bridge";
import { HomeHero } from "@/components/home-hero";
import { MatchRibbon } from "@/components/match-ribbon";
import { RegistrationSection } from "@/components/registration-section";
import { Footer } from "@/components/footer";
import { isValidLocale } from "@/i18n/config";
import { getVegaltaMatches } from "@/lib/football-api";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const matches = await getVegaltaMatches();

  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <HashScrollHandler />
      <Header overlay />

      <div className="relative flex w-full flex-col overflow-x-hidden md:h-[100dvh] md:overflow-hidden">
        <div className="relative md:min-h-0 md:flex-1">
          <HomeHero locale={rawLocale} />
          <HeroLogoBridge />
        </div>
        <MatchRibbon matches={matches} />
      </div>
      <RegistrationSection />
      <AnthemSection />
      <CommunityCtaSection />
      <Footer />
    </div>
  );
}
