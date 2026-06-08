import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  HIMNO_YOUTUBE_URL,
  TELEGRAM_COMMUNITY_URL,
} from "@/lib/constants";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://vegalta.es";

export const SITE_NAME = "Vegalta Sendai Hispano";
export const SITE_DOMAIN = "vegalta.es";

const OG_IMAGE_PATH = "/assets/branding/logo-hispano.png";

export function absoluteUrl(path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE_URL).toString();
}

export function localeToHrefLang(locale: Locale): string {
  return locale === "jp" ? "ja" : "es";
}

export function buildLanguageAlternates(
  pathWithoutLocale = ""
): NonNullable<Metadata["alternates"]>["languages"] {
  const suffix = pathWithoutLocale ? `/${pathWithoutLocale}` : "";
  return {
    es: absoluteUrl(`/es${suffix}`),
    ja: absoluteUrl(`/jp${suffix}`),
    "x-default": absoluteUrl(`/es${suffix}`),
  };
}

type PageMetadataOptions = {
  locale: Locale;
  path: string;
  meta: Dictionary["meta"];
  robots?: Metadata["robots"];
  title?: string;
};

export function buildPageMetadata({
  locale,
  path,
  meta,
  robots,
  title,
}: PageMetadataOptions): Metadata {
  const pageTitle = title ?? meta.title;
  const canonical = absoluteUrl(path);
  const ogLocale = locale === "es" ? "es_ES" : "ja_JP";
  const alternateOgLocale = locale === "es" ? ["ja_JP"] : ["es_ES"];
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    title: {
      default: pageTitle,
      template: `%s | ${SITE_NAME}`,
    },
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "sports",
    applicationName: SITE_NAME,
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical,
      languages: buildLanguageAlternates(
        path.replace(/^\/(es|jp)/, "") || undefined
      ),
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateOgLocale,
      url: canonical,
      siteName: SITE_NAME,
      title: pageTitle,
      description: meta.ogDescription,
      images: [
        {
          url: OG_IMAGE_PATH,
          width: 512,
          height: 512,
          alt: meta.ogImageAlt,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: meta.ogDescription,
      images: [OG_IMAGE_PATH],
    },
    robots: robots ?? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...(googleVerification
      ? { verification: { google: googleVerification } }
      : {}),
  };
}

export function buildWebsiteJsonLd(
  locale: Locale,
  meta: Dictionary["meta"]
): Record<string, unknown> {
  const homeUrl = absoluteUrl(`/${locale}`);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: homeUrl,
        name: SITE_NAME,
        description: meta.description,
        inLanguage: ["es-ES", "ja-JP"],
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl(OG_IMAGE_PATH),
        },
        description: meta.description,
        sameAs: [TELEGRAM_COMMUNITY_URL, HIMNO_YOUTUBE_URL],
      },
      {
        "@type": "WebPage",
        "@id": `${homeUrl}#webpage`,
        url: homeUrl,
        name: meta.title,
        description: meta.description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: localeToHrefLang(locale),
      },
      {
        "@type": "SportsOrganization",
        "@id": `${SITE_URL}/#fan-community`,
        name: SITE_NAME,
        sport: "Soccer",
        description: meta.description,
        url: homeUrl,
        parentOrganization: {
          "@type": "SportsTeam",
          name: "Vegalta Sendai",
          url: "https://www.vegalta.co.jp/",
        },
      },
    ],
  };
}
