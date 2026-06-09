import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FixturesCalendar } from "@/components/fixtures-calendar";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SectionHeading } from "@/components/section-heading";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { getSeasonFixtures } from "@/lib/football-api";
import { buildPageMetadata } from "@/lib/seo";

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
    path: `/${rawLocale}/calendario`,
    meta: {
      ...dict.meta,
      title: dict.calendar.metaTitle,
      description: dict.calendar.metaDescription,
      ogDescription: dict.calendar.metaDescription,
    },
    title: dict.calendar.metaTitle,
  });
}

export default async function CalendarPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const dict = await getDictionary(rawLocale);
  const homePath = localizedPath(rawLocale);
  const seasonData = await getSeasonFixtures();

  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <Header />

      <main className="mx-auto w-full max-w-portal flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <SectionHeading
          title={dict.calendar.title}
          subtitle={dict.calendar.subtitle}
        />

        <div className="mt-8 sm:mt-10">
          <FixturesCalendar data={seasonData} />
        </div>

        <div className="mt-10 text-center sm:text-left">
          <Link
            href={homePath}
            className="text-sm font-semibold text-portal-primary/70 transition-colors hover:text-portal-primary"
          >
            {dict.calendar.backHome}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
