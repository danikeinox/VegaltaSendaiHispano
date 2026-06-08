import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MembershipCard } from "@/components/membership-card";
import { WalletButtons } from "@/components/wallet-buttons";
import { isAppleWalletConfigured } from "@/lib/wallet/apple-pass";
import { isGoogleWalletConfigured } from "@/lib/wallet/google-wallet";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { findMemberByDisplayId } from "@/lib/members";
import { createMemberLookupSchema } from "@/lib/validations";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";

type PageProps = { params: Promise<{ locale: string; displayId: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isValidLocale(rawLocale)) {
    return {};
  }

  const dict = await getDictionary(rawLocale);

  return {
    title: dict.carnet.title,
    description: dict.carnet.subtitle,
    robots: { index: false, follow: false },
  };
}

export default async function CarnetPage({ params }: PageProps) {
  const { locale: rawLocale, displayId: rawId } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const dict = await getDictionary(rawLocale);
  const memberLookupSchema = createMemberLookupSchema(dict.validation);

  let displayId: string;
  try {
    ({ displayId } = memberLookupSchema.parse({ displayId: rawId }));
  } catch {
    notFound();
  }

  const member = await findMemberByDisplayId(displayId);

  if (!member) {
    notFound();
  }

  const displayIdParam = encodeURIComponent(member.displayId);
  const appleConfigured = isAppleWalletConfigured();
  const googleConfigured = isGoogleWalletConfigured();
  const appleUrl = appleConfigured
    ? `/api/wallet/apple?displayId=${displayIdParam}`
    : null;
  const googleApiUrl = googleConfigured
    ? `/api/wallet/google?displayId=${displayIdParam}`
    : null;
  const dateLocale = rawLocale === "jp" ? "ja-JP" : "es-ES";

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6fa]">
      <Header />

      <div className="h-1 bg-gradient-to-r from-vegalta-blue via-vegalta-red to-vegalta-gold" />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col items-center gap-6 sm:gap-8 w-full max-w-2xl">
        <SectionHeading
          title={dict.carnet.title}
          subtitle={dict.carnet.subtitle}
        />

        <MembershipCard
          displayId={member.displayId}
          firstName={member.firstName}
          lastName={member.lastName}
          officialCardLabel={dict.carnet.officialCard}
        />

        <div className="bg-white border border-vegalta-royal-blue/10 shadow-sm px-6 py-4 text-center text-vegalta-blue/70 text-sm space-y-1 w-full max-w-md">
          {member.country && (
            <p>
              {dict.carnet.country}: {member.country}
            </p>
          )}
          <p>
            {dict.carnet.memberSince}:{" "}
            {new Date(member.createdAt).toLocaleDateString(dateLocale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <WalletButtons
          appleUrl={appleUrl}
          googleUrl={googleApiUrl}
          appleLabel={dict.headline.appleWallet}
          googleLabel={dict.headline.googleWallet}
          androidLabel={dict.register.downloadAndroid}
          appleAvailable={appleConfigured}
          googleAvailable={googleConfigured}
          appleUnavailableNote={dict.register.appleUnavailable}
        />

        <Link
          href={localizedPath(rawLocale)}
          className="text-vegalta-royal-blue/60 hover:text-vegalta-royal-blue text-sm vegalta-section-title tracking-wider"
        >
          {dict.carnet.backHome}
        </Link>
      </main>

      <Footer />
    </div>
  );
}
