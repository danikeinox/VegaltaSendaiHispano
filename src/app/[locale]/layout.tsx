import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { LocaleProvider } from "@/components/locale-provider";
import { SetHtmlLang } from "@/components/set-html-lang";
import { isValidLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const dict = await getDictionary(rawLocale);

  return buildPageMetadata({
    locale: rawLocale,
    path: `/${rawLocale}`,
    meta: dict.meta,
  });
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  return (
    <LocaleProvider locale={locale} dict={dict}>
      <SetHtmlLang locale={locale} />
      <JsonLd locale={locale} meta={dict.meta} />
      {children}
    </LocaleProvider>
  );
}
