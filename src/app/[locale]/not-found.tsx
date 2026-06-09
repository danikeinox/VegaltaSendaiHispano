"use client";

import { NotFoundPage } from "@/components/not-found-page";
import { useLocale } from "@/components/locale-provider";

export default function LocaleNotFound() {
  const { locale, dict } = useLocale();

  return <NotFoundPage dict={dict} locale={locale} />;
}
