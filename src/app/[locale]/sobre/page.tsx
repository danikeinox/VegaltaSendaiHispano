import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SupportCallout } from "@/components/support-callout";
import { SectionHeading } from "@/components/section-heading";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const dict = await getDictionary(rawLocale);

  return buildPageMetadata({
    locale: rawLocale,
    path: `/${rawLocale}/sobre`,
    meta: {
      ...dict.meta,
      title: dict.about.metaTitle,
      description: dict.about.metaDescription,
      ogDescription: dict.about.metaDescription,
    },
    title: dict.about.metaTitle,
  });
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const dict = await getDictionary(rawLocale);
  const homePath = localizedPath(rawLocale);
  const aboutUrl = absoluteUrl(`/${rawLocale}/sobre`);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dict.about.title,
    description: dict.about.metaDescription,
    url: aboutUrl,
    inLanguage: rawLocale === "jp" ? "ja" : "es",
    author: {
      "@type": "Organization",
      name: "Vegalta Sendai Hispano",
    },
    publisher: {
      "@type": "Organization",
      name: "Vegalta Sendai Hispano",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/assets/branding/logo-hispano.png"),
      },
    },
    mainEntityOfPage: aboutUrl,
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6fa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full max-w-3xl">
        <SectionHeading
          title={dict.about.title}
          subtitle={dict.about.subtitle}
          className="mb-10"
        />

        <article className="space-y-10">
          {dict.about.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="vegalta-section-title text-vegalta-royal-blue text-lg sm:text-xl font-bold mb-4">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-vegalta-blue/80 text-sm sm:text-base leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <div className="mt-12 flex justify-center">
          <SupportCallout className="mx-auto" />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
          <Link
            href={`${homePath}#registro`}
            className="inline-flex items-center justify-center min-h-11 px-5 py-3 bg-vegalta-royal-blue text-white hover:bg-vegalta-blue-light text-xs vegalta-section-title font-bold tracking-wide transition-colors text-center"
          >
            {dict.about.ctaRegister}
          </Link>
          <Link
            href={`${homePath}#himno`}
            className="inline-flex items-center justify-center min-h-11 px-5 py-3 border-2 border-vegalta-royal-blue text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 bg-white text-xs vegalta-section-title font-bold tracking-wide transition-colors text-center"
          >
            {dict.about.ctaAnthem}
          </Link>
        </div>

        <p className="mt-10 text-center">
          <Link
            href={homePath}
            className="text-vegalta-royal-blue/60 hover:text-vegalta-royal-blue text-sm vegalta-section-title tracking-wider"
          >
            {dict.about.backHome}
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
