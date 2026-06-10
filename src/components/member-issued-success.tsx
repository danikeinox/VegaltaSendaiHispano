"use client";

import { useState } from "react";
import { MembershipPreviewCard } from "@/components/membership-preview-card";
import {
  RegistrationForm,
  type RegisterResult,
} from "@/components/registration-form";
import { useLocale } from "@/components/locale-provider";

type MemberIssuedSuccessProps = {
  issued: RegisterResult;
  onReset?: () => void;
  showHeader?: boolean;
};

export function MemberIssuedSuccess({
  issued,
  onReset,
  showHeader = true,
}: MemberIssuedSuccessProps) {
  const { dict } = useLocale();
  const [googleSaveUrl, setGoogleSaveUrl] = useState<string | null>(null);

  return (
    <div className="w-full">
      {showHeader && (
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="font-display text-2xl font-bold text-portal-primary sm:text-3xl">
            {dict.register.successTitle}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-portal-on-surface-variant sm:text-base">
            {dict.register.successSubtitle}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
        <div className="min-w-0 lg:col-span-7">
          <MembershipPreviewCard
            previewName=""
            issued={issued.member}
            verificationUrl={issued.verification.url}
          />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <RegistrationForm
            variant="portal"
            issued={issued}
            googleSaveUrl={googleSaveUrl}
            onGoogleSaveUrl={setGoogleSaveUrl}
            onReset={onReset}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
