import Link from "next/link";
import { MemberIssuedSuccess } from "@/components/member-issued-success";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { completeMemberRecovery } from "@/lib/recovery-flow";
import { isRegistrationDisabled } from "@/lib/registration-config";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function RecoverPage({ params }: PageProps) {
  const { locale: rawLocale, token } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const dict = await getDictionary(rawLocale);

  if (isRegistrationDisabled()) {
    return (
      <div className="flex min-h-screen flex-col bg-portal-surface">
        <Header />
        <main className="container mx-auto flex flex-1 flex-col items-center px-4 py-10 sm:py-14">
          <div className="w-full max-w-lg rounded-2xl border border-portal-outline-variant bg-white p-6 text-center portal-card-shadow sm:p-8">
            <p className="text-sm text-portal-on-surface-variant">
              {dict.register.disabledMessage}
            </p>
            <Link
              href={`${localizedPath(rawLocale)}#registro`}
              className="mt-4 inline-block text-sm font-semibold text-portal-primary hover:underline"
            >
              {dict.recover.backToRegister}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const issued = await completeMemberRecovery(token, rawLocale);

  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col items-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-portal">
          {!issued ? (
            <div className="mx-auto max-w-lg rounded-2xl border border-portal-outline-variant bg-white p-6 text-center portal-card-shadow sm:p-8">
              <p className="text-sm text-vegalta-red">{dict.recover.invalid}</p>
              <Link
                href={`${localizedPath(rawLocale)}#registro`}
                className="mt-4 inline-block text-sm font-semibold text-portal-primary hover:underline"
              >
                {dict.recover.backToRegister}
              </Link>
            </div>
          ) : (
            <MemberIssuedSuccess issued={issued} showHeader />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
