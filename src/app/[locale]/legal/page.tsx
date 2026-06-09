import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LegalDocument } from "@/components/legal-document";
import { SectionHeading } from "@/components/section-heading";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { LEGAL_CONTACT_EMAIL } from "@/lib/legal";
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
    path: `/${rawLocale}/legal`,
    meta: {
      ...dict.meta,
      title: dict.legal.metaTitle,
      description: dict.legal.metaDescription,
      ogDescription: dict.legal.metaDescription,
    },
    title: dict.legal.metaTitle,
    robots: { index: true, follow: true },
  });
}

export default async function LegalPage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const dict = await getDictionary(rawLocale);
  const homePath = localizedPath(rawLocale);
  const legalPath = `${homePath}/legal`;

  const navItems = [
    { id: "aviso-legal", label: dict.legal.nav.notice, href: `${legalPath}#aviso-legal` },
    { id: "privacidad", label: dict.legal.nav.privacy, href: `${legalPath}#privacidad` },
    { id: "cookies", label: dict.legal.nav.cookies, href: `${legalPath}#cookies` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <Header />

      <main className="container mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <SectionHeading
          title={dict.legal.title}
          subtitle={dict.legal.subtitle}
          className="mb-8"
        />

        <p className="mb-8 text-sm text-portal-on-surface-variant">
          {dict.legal.lastUpdated}
        </p>

        <nav
          aria-label={dict.legal.navLabel}
          className="mb-10 flex flex-wrap gap-2"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="rounded-full border border-portal-outline-variant bg-white px-4 py-2 text-xs font-semibold text-portal-primary transition-colors hover:bg-portal-surface-container"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mb-10 rounded-xl border border-portal-outline-variant bg-white p-5 text-sm text-portal-on-surface shadow-sm">
          <p>{dict.legal.contactIntro}</p>
          <a
            href={`mailto:${LEGAL_CONTACT_EMAIL}`}
            className="mt-2 inline-block font-semibold text-portal-primary underline-offset-2 hover:underline"
          >
            {LEGAL_CONTACT_EMAIL}
          </a>
        </div>

        <div className="space-y-14">
          <LegalDocument
            id="aviso-legal"
            title={dict.legal.notice.title}
            sections={dict.legal.notice.sections}
          />
          <LegalDocument
            id="privacidad"
            title={dict.legal.privacy.title}
            sections={dict.legal.privacy.sections}
          />
          <LegalDocument
            id="cookies"
            title={dict.legal.cookies.title}
            sections={dict.legal.cookies.sections}
            cookieTable={dict.legal.cookies.items}
            cookieTableHeaders={dict.legal.cookies.tableHeaders}
          />
        </div>

        <p className="mt-12 text-center">
          <Link
            href={homePath}
            className="text-sm font-semibold tracking-wide text-portal-primary/70 transition-colors hover:text-portal-primary"
          >
            {dict.legal.backHome}
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
