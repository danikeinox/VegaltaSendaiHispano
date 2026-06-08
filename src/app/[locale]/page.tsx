import { AnthemSection } from "@/components/anthem-section";
import { RegistrationForm } from "@/components/registration-form";
import { HashScrollHandler } from "@/components/hash-scroll-handler";
import { Header } from "@/components/header";
import { HomeHero } from "@/components/home-hero";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { TelegramJoinButton } from "@/components/telegram-join-button";
import { FaApple, FaGoogle, FaIdCard, FaWallet } from "react-icons/fa";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const benefitAccents = [
  "border-vegalta-royal-blue",
  "border-vegalta-gold",
  "border-vegalta-red",
] as const;

const benefitIcons = [FaIdCard, FaWallet, FaGoogle];

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const dict = await getDictionary(rawLocale);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6fa]">
      <HashScrollHandler />
      <Header />

      <HomeHero locale={rawLocale} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full max-w-6xl">
        <section id="beneficios" className="mb-16 pt-2 scroll-mt-[var(--header-scroll-offset)]">
          <SectionHeading
            title={dict.benefits.title}
            subtitle={dict.benefits.subtitle}
            className="mb-10"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
            {dict.benefits.items.map((item, index) => {
              const Icon = benefitIcons[index];
              return (
                <div
                  key={item.title}
                  className={`bg-white border-t-4 ${benefitAccents[index]} shadow-sm hover:shadow-md transition-shadow p-6`}
                >
                  <Icon className="text-vegalta-royal-blue text-2xl mb-4" />
                  <h3 className="vegalta-section-title text-vegalta-royal-blue text-sm font-bold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-vegalta-blue/70 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-16 max-w-4xl mx-auto">
          <div className="bg-vegalta-royal-blue text-white p-5 sm:p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-full bg-vegalta-red/30 skew-x-[-12deg] translate-x-6 sm:translate-x-8" />
            <p className="vegalta-section-title text-vegalta-gold-light text-[10px] sm:text-xs mb-2 tracking-[0.2em] sm:tracking-[0.25em]">
              {dict.headline.label}
            </p>
            <h3 className="text-base sm:text-lg md:text-xl font-bold leading-snug relative pr-2">
              {dict.headline.text}
            </h3>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mt-5 relative">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <FaApple className="text-vegalta-gold-light shrink-0" />
                {dict.headline.appleWallet}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <FaGoogle className="text-vegalta-gold-light shrink-0" />
                {dict.headline.googleWallet}
              </div>
              <TelegramJoinButton className="text-xs px-4 py-2 w-full sm:w-auto justify-center" />
            </div>
          </div>
        </section>

        <section id="registro" className="flex flex-col items-center w-full px-0 sm:px-2 pt-2 scroll-mt-[var(--header-scroll-offset)]">
          <SectionHeading
            title={dict.register.title}
            subtitle={dict.register.subtitle}
            className="mb-10"
          />
          <RegistrationForm />
        </section>

        <AnthemSection />
      </main>

      <Footer />
    </div>
  );
}
