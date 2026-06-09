import { LocaleProvider } from "@/components/locale-provider";
import { NotFoundPage } from "@/components/not-found-page";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function RootNotFound() {
  const dict = await getDictionary("es");

  return (
    <LocaleProvider locale="es" dict={dict}>
      <NotFoundPage dict={dict} locale="es" />
    </LocaleProvider>
  );
}
