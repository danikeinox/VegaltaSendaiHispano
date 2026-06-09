import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { absoluteUrl } from "@/lib/seo";

const STATIC_ROUTES = ["", "/sobre", "/calendario", "/legal"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const languages = {
    es: absoluteUrl("/es"),
    ja: absoluteUrl("/jp"),
    "x-default": absoluteUrl("/es"),
  };

  return locales.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(`/${locale}${route}`),
      lastModified,
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.8,
      alternates: {
        languages: route === ""
          ? languages
          : {
              es: absoluteUrl(`/es${route}`),
              ja: absoluteUrl(`/jp${route}`),
              "x-default": absoluteUrl(`/es${route}`),
            },
      },
    }))
  );
}
