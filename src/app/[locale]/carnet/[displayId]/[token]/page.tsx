import type { Metadata } from "next";
import { headers } from "next/headers";
import { getClientIpFromHeaders } from "@/lib/security/error-handler";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CarnetSharePanel } from "@/components/carnet-share-panel";
import { MemberQrCode } from "@/components/member-qr-code";
import { SupportCallout } from "@/components/support-callout";
import { WalletButtons } from "@/components/wallet-buttons";
import { getWalletAvailability } from "@/lib/wallet/config";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SectionHeading } from "@/components/section-heading";
import { findMemberByDisplayId } from "@/lib/members";
import { createMemberLookupSchema } from "@/lib/validations";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { checkMemberLookupRateLimit } from "@/lib/security/rate-limit";
import {
  buildMemberAccessQuery,
  createMemberVerificationUrl,
  verifyPrivateAccessToken,
} from "@/lib/verification";

type PageProps = {
  params: Promise<{ locale: string; displayId: string; token: string }>;
};

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
  const { locale: rawLocale, displayId: rawId, token } = await params;

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

  const headerList = await headers();
  const ip = getClientIpFromHeaders(headerList);
  const rateLimit = await checkMemberLookupRateLimit(ip);

  if (!rateLimit.success) {
    notFound();
  }

  const member = await findMemberByDisplayId(displayId);

  if (!member || !verifyPrivateAccessToken(member, token)) {
    notFound();
  }

  const accessQuery = buildMemberAccessQuery(member, token);
  const wallets = getWalletAvailability();
  const appleUrl = wallets.apple ? `/api/wallet/apple?${accessQuery}` : null;
  const googleApiUrl = wallets.google
    ? `/api/wallet/google?${accessQuery}`
    : null;
  const samsungUrl = wallets.samsung
    ? `/api/wallet/google?${accessQuery}`
    : null;
  const dateLocale = rawLocale === "jp" ? "ja-JP" : "es-ES";
  const verificationUrl = createMemberVerificationUrl(rawLocale, member);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6fa]">
      <Header />

      <div className="h-1 bg-gradient-to-r from-vegalta-blue via-vegalta-red to-vegalta-gold" />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col items-center gap-6 sm:gap-8 w-full max-w-2xl">
        <SectionHeading
          title={dict.carnet.title}
          subtitle={dict.carnet.subtitle}
        />

        <CarnetSharePanel
          displayId={member.displayId}
          accessToken={token}
          firstName={member.firstName}
          lastName={member.lastName}
          officialCardLabel={dict.carnet.officialCard}
          shareTitle={dict.carnet.shareTitle}
          shareSubtitle={dict.carnet.shareSubtitle}
          shareSheetTitle={dict.carnet.shareSheetTitle}
          shareHint={dict.carnet.shareHint}
          sharePrivacyWarning={dict.carnet.sharePrivacyWarning}
          downloadLabel={dict.carnet.downloadImage}
          shareLabel={dict.carnet.shareImage}
          exportingLabel={dict.carnet.exportingImage}
          shareError={dict.carnet.shareError}
          shareUnsupported={dict.carnet.shareUnsupported}
        />

        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-vegalta-royal-blue/20 bg-white px-6 py-4 shadow-sm">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-vegalta-blue/60">
            {dict.carnet.verificationSection}
          </p>
          <p className="text-center text-xs text-vegalta-blue/50">
            {dict.verification.qrLabel}
          </p>
          <MemberQrCode
            url={verificationUrl}
            size={128}
            label={dict.verification.qrLabel}
          />
          <p className="text-center text-xs text-vegalta-blue/60">
            {dict.verification.qrHint}
          </p>
        </div>

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
          samsungUrl={samsungUrl}
          appleLabel={dict.headline.appleWallet}
          googleLabel={dict.headline.googleWallet}
          samsungLabel={dict.register.addSamsungWallet}
          androidLabel={dict.register.downloadAndroid}
          appleAvailable={wallets.apple}
          googleAvailable={wallets.google}
          samsungAvailable={wallets.samsung}
          inDevelopment={wallets.inDevelopment}
          developmentTitle={dict.register.walletsDevelopmentTitle}
          developmentNote={dict.register.walletsDevelopmentNote}
          comingSoonLabel={dict.register.walletsComingSoon}
          appleUnavailableNote={dict.register.appleUnavailable}
        />

        {wallets.inDevelopment && (
          <SupportCallout showAppleNote className="mx-auto" />
        )}

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
