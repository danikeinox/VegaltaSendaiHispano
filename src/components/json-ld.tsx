import { buildWebsiteJsonLd } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";

type JsonLdProps = {
  locale: Locale;
  meta: Dictionary["meta"];
};

export function JsonLd({ locale, meta }: JsonLdProps) {
  const data = buildWebsiteJsonLd(locale, meta);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
