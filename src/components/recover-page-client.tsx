"use client";

import Link from "next/link";
import { useState } from "react";
import { MemberIssuedSuccess } from "@/components/member-issued-success";
import type { RegisterResult } from "@/components/registration-form";
import { Button } from "@/components/ui/button";
import { localizedPath } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

type RecoverPageClientProps = {
  token: string;
  locale: Locale;
  copy: {
    confirmTitle: string;
    confirmDescription: string;
    confirmButton: string;
    confirming: string;
    invalid: string;
    backToRegister: string;
    connectionError: string;
  };
};

export function RecoverPageClient({
  token,
  locale,
  copy,
}: RecoverPageClientProps) {
  const [issued, setIssued] = useState<RegisterResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (issued) {
    return <MemberIssuedSuccess issued={issued} showHeader />;
  }

  async function onConfirm() {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/recover/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Locale": locale,
        },
        body: JSON.stringify({ token }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error ?? copy.invalid);
        return;
      }

      setIssued(json as RegisterResult);
    } catch {
      setError(copy.connectionError);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-portal-outline-variant bg-white p-6 text-center portal-card-shadow sm:p-8">
        <p className="text-sm text-vegalta-red">{error}</p>
        <Link
          href={`${localizedPath(locale)}#registro`}
          className="mt-4 inline-block text-sm font-semibold text-portal-primary hover:underline"
        >
          {copy.backToRegister}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-portal-outline-variant bg-white p-6 text-center portal-card-shadow sm:p-8">
      <h1 className="font-display text-xl font-bold text-portal-primary sm:text-2xl">
        {copy.confirmTitle}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-portal-on-surface-variant">
        {copy.confirmDescription}
      </p>
      <Button
        className="mt-6 h-12 w-full bg-portal-gold text-portal-gold-text hover:bg-portal-gold-light"
        onClick={onConfirm}
        disabled={submitting}
      >
        {submitting ? copy.confirming : copy.confirmButton}
      </Button>
    </div>
  );
}
