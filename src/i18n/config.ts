export const locales = ["es", "jp"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";
export const localeCookie = "vegalta_locale";

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
