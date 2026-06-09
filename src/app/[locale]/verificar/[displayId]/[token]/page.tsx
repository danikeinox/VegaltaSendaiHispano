import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheckCircle, FaExclamationTriangle, FaEye } from "react-icons/fa";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MemberQrCode } from "@/components/member-qr-code";
import { isValidLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizedPath } from "@/i18n/navigation";
import { findMemberByDisplayId } from "@/lib/members";
import { createMemberLookupSchema } from "@/lib/validations";
import {
  createMemberVerificationUrl,
  isPreviewVerificationToken,
  PREVIEW_DISPLAY_ID,
  verifyPublicVerificationToken,
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
    title: dict.verification.title,
    description: dict.verification.subtitle,
    robots: { index: false, follow: false },
  };
}

export default async function VerificationPage({ params }: PageProps) {
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

  const dateLocale = rawLocale === "jp" ? "ja-JP" : "es-ES";
  const member = await findMemberByDisplayId(displayId);

  if (member && verifyPublicVerificationToken(displayId, token)) {
    const verificationUrl = createMemberVerificationUrl(rawLocale, member);
    const memberName = `${member.firstName} ${member.lastName}`;
    const memberSince = new Date(member.createdAt).toLocaleDateString(
      dateLocale,
      {
        year: "numeric",
        month: "long",
      }
    );

    return (
      <VerificationLayout locale={rawLocale}>
        <StatusCard
          icon={
            <FaCheckCircle className="text-3xl text-emerald-600" aria-hidden />
          }
          badgeClassName="bg-emerald-100 text-emerald-800"
          badge={dict.verification.verifiedBadge}
          title={dict.verification.verifiedTitle}
          subtitle={dict.verification.verifiedSubtitle}
        >
          <div className="rounded-xl bg-portal-primary p-5 text-white portal-card-shadow">
            <p className="text-xs uppercase tracking-widest text-white/60">
              {dict.verification.memberLabel}
            </p>
            <p className="mt-1 font-display text-xl font-bold uppercase tracking-wide">
              {memberName}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <DetailRow
                label={dict.verification.memberId}
                value={member.displayId}
                inverted
              />
              <DetailRow
                label={dict.verification.memberSince}
                value={memberSince}
                inverted
              />
            </div>
          </div>

          {member.country && (
            <DetailRow
              label={dict.verification.country}
              value={member.country}
            />
          )}

          <div className="flex items-center justify-between gap-4 rounded-xl border border-portal-outline-variant bg-portal-surface-container p-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-portal-on-surface-variant">
                {dict.verification.qrLabel}
              </p>
              <p className="mt-1 text-sm text-portal-on-surface-variant">
                {dict.verification.qrHint}
              </p>
            </div>
            <MemberQrCode
              url={verificationUrl}
              size={72}
              label={dict.verification.qrLabel}
            />
          </div>

          <p className="text-center text-xs text-portal-on-surface-variant">
            {dict.verification.disclaimer}
          </p>
        </StatusCard>
      </VerificationLayout>
    );
  }

  const isPreview =
    displayId === PREVIEW_DISPLAY_ID && isPreviewVerificationToken(token);

  if (isPreview) {
    return (
      <VerificationLayout locale={rawLocale}>
        <StatusCard
          icon={<FaEye className="text-3xl text-portal-gold" aria-hidden />}
          badgeClassName="bg-portal-gold/15 text-portal-gold-text"
          badge={dict.verification.previewBadge}
          title={dict.verification.previewTitle}
          subtitle={dict.verification.previewSubtitle}
        >
          <DetailRow label={dict.verification.memberId} value={displayId} />
          <p className="text-sm text-portal-on-surface-variant">
            {dict.verification.previewNote}
          </p>
          <Link
            href={`${localizedPath(rawLocale)}#registro`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-portal-gold px-4 py-3 text-sm font-bold uppercase tracking-wide text-portal-gold-text transition-colors hover:bg-portal-gold-light"
          >
            {dict.verification.getCard}
          </Link>
        </StatusCard>
      </VerificationLayout>
    );
  }

  return (
    <VerificationLayout locale={rawLocale}>
      <StatusCard
        icon={
          <FaExclamationTriangle
            className="text-3xl text-vegalta-red"
            aria-hidden
          />
        }
        badgeClassName="bg-vegalta-red/10 text-vegalta-red"
        badge={dict.verification.invalidBadge}
        title={dict.verification.invalidTitle}
        subtitle={dict.verification.invalidSubtitle}
      >
        <Link
          href={localizedPath(rawLocale)}
          className="inline-flex w-full items-center justify-center rounded-lg border border-portal-outline-variant px-4 py-3 text-sm font-semibold text-portal-primary transition-colors hover:bg-portal-surface-container"
        >
          {dict.verification.backHome}
        </Link>
      </StatusCard>
    </VerificationLayout>
  );
}

function VerificationLayout({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-portal-surface">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

function StatusCard({
  icon,
  badge,
  badgeClassName,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  badge: string;
  badgeClassName: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-portal-outline-variant bg-white p-6 portal-card-shadow sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-portal-surface-container">
          {icon}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badgeClassName}`}
        >
          {badge}
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-portal-primary">
          {title}
        </h1>
        <p className="mt-2 text-sm text-portal-on-surface-variant">{subtitle}</p>
      </div>
      <div className="mt-8 space-y-4">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: string;
  inverted?: boolean;
}) {
  return (
    <div>
      <p
        className={
          inverted
            ? "text-xs uppercase tracking-wide text-white/60"
            : "text-xs uppercase tracking-wide text-portal-on-surface-variant"
        }
      >
        {label}
      </p>
      <p
        className={
          inverted
            ? "mt-0.5 font-display text-sm font-bold text-white"
            : "mt-0.5 font-display text-sm font-bold text-portal-primary"
        }
      >
        {value}
      </p>
    </div>
  );
}
