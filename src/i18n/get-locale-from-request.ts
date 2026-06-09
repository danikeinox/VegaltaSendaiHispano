import { defaultLocale, isValidLocale, type Locale } from "@/i18n/config";

export function getLocaleFromRequest(request: Request): Locale {
  const headerLocale = request.headers.get("x-locale");
  if (headerLocale && isValidLocale(headerLocale)) {
    return headerLocale;
  }

  return defaultLocale;
}
