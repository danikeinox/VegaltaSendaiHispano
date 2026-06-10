"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CountrySelect } from "@/components/country-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecoverMemberForm } from "@/components/recover-member-form";
import { SupportCallout } from "@/components/support-callout";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { WalletButtons } from "@/components/wallet-buttons";
import { useLocale } from "@/components/locale-provider";
import { localizedPath } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  createRegistrationSchema,
  type RegistrationInput,
} from "@/lib/validations";
import { isRegistrationDisabledClient } from "@/lib/registration-config";

export type RegisterResult = {
  member: {
    displayId: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string | null;
    createdAt?: string;
  };
  isNew: boolean;
  wallet: {
    apple: string | null;
    google: string | null;
    samsung: string | null;
  };
  walletAvailable: {
    apple: boolean;
    google: boolean;
    samsung: boolean;
  };
  walletsInDevelopment?: boolean;
  verification: {
    url: string;
  };
  carnet: {
    url: string;
  };
};

type RegistrationFormProps = {
  variant?: "default" | "portal";
  issued?: RegisterResult | null;
  googleSaveUrl?: string | null;
  onPreviewNameChange?: (name: string) => void;
  onIssued?: (result: RegisterResult) => void;
  onGoogleSaveUrl?: (url: string | null) => void;
  onReset?: () => void;
  className?: string;
};

export function RegistrationForm({
  variant = "default",
  issued = null,
  googleSaveUrl = null,
  onPreviewNameChange,
  onIssued,
  onGoogleSaveUrl,
  onReset,
  className,
}: RegistrationFormProps) {
  const { locale, dict } = useLocale();
  const registrationDisabled = isRegistrationDisabledClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [pendingHint, setPendingHint] = useState<string | null>(null);
  const [showRecover, setShowRecover] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  const registrationSchema = useMemo(
    () => createRegistrationSchema(dict.validation),
    [dict.validation]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { country: "", acceptPrivacy: false },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  useEffect(() => {
    if (!onPreviewNameChange || issued) return;
    onPreviewNameChange(`${firstName ?? ""} ${lastName ?? ""}`.trim());
  }, [firstName, lastName, onPreviewNameChange, issued]);

  useEffect(() => {
    const googleWalletUrl = issued?.wallet.google;
    if (!googleWalletUrl || googleSaveUrl) return;

    const walletUrl: string = googleWalletUrl;
    let cancelled = false;

    async function loadGoogleSaveUrl() {
      try {
        const googleRes = await fetch(walletUrl, {
          headers: { "X-Locale": locale },
        });
        const googleJson = await googleRes.json();
        if (!cancelled && googleJson.saveUrl) {
          onGoogleSaveUrl?.(googleJson.saveUrl);
        }
      } catch {
        // Google Wallet opcional; no bloquear la vista del carnet.
      }
    }

    void loadGoogleSaveUrl();

    return () => {
      cancelled = true;
    };
  }, [issued, googleSaveUrl, locale, onGoogleSaveUrl]);

  async function onSubmit(data: RegistrationInput) {
    setSubmitError(null);
    setPendingMessage(null);
    setPendingHint(null);
    onGoogleSaveUrl?.(null);

    if (turnstileSiteKey && !turnstileToken) {
      setSubmitError(dict.register.registerError);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Locale": locale,
        },
        body: JSON.stringify({
          ...data,
          ...(turnstileSiteKey ? { turnstileToken } : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error ?? dict.register.registerError);
        return;
      }

      if (json.pending) {
        setPendingMessage(json.message ?? dict.register.pendingExisting);
        setPendingHint(json.hint ?? dict.register.recoverEmailNotice);
        return;
      }

      onIssued?.(json);

      if (json.wallet.google) {
        const googleRes = await fetch(json.wallet.google, {
          headers: { "X-Locale": locale },
        });
        const googleJson = await googleRes.json();
        if (googleJson.saveUrl) {
          onGoogleSaveUrl?.(googleJson.saveUrl);
        }
      }
    } catch {
      setSubmitError(dict.register.connectionError);
    }
  }

  if (issued && variant === "portal") {
    return (
      <div
        className={cn(
          "flex h-full w-full min-w-0 max-w-full flex-col gap-5 rounded-2xl border border-portal-outline-variant bg-white p-6 portal-card-shadow sm:p-8",
          className
        )}
      >
        <p className="text-sm leading-relaxed text-portal-on-surface-variant">
          {issued.isNew
            ? dict.register.welcomeNew
            : dict.register.welcomeExisting}
        </p>

        <Link
          href={issued.carnet.url}
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-portal-gold px-8 text-sm font-bold uppercase tracking-wider text-portal-gold-text transition-colors hover:bg-portal-gold-light"
        >
          {dict.register.viewFullCarnet}
        </Link>

        <p className="text-xs text-portal-on-surface-variant">
          {dict.register.carnetLinkHint}
        </p>

        <p className="text-xs text-portal-on-surface-variant">
          {dict.verification.qrHint}
        </p>

        <WalletButtons
          appleUrl={issued.wallet.apple}
          googleUrl={issued.wallet.google}
          samsungUrl={issued.wallet.samsung}
          googleSaveUrl={googleSaveUrl}
          appleLabel={dict.register.addAppleWallet}
          googleLabel={dict.register.addGoogleWallet}
          samsungLabel={dict.register.addSamsungWallet}
          androidLabel={dict.register.downloadAndroid}
          appleAvailable={issued.walletAvailable.apple}
          googleAvailable={issued.walletAvailable.google}
          samsungAvailable={issued.walletAvailable.samsung}
          inDevelopment={issued.walletsInDevelopment}
          developmentTitle={dict.register.walletsDevelopmentTitle}
          developmentNote={dict.register.walletsDevelopmentNote}
          comingSoonLabel={dict.register.walletsComingSoon}
          appleUnavailableNote={dict.register.appleUnavailable}
        />

        {issued.walletsInDevelopment && (
          <SupportCallout showAppleNote className="mx-auto w-full" />
        )}

        <Button
          variant="ghost"
          className="mt-auto"
          onClick={() => {
            reset();
            onReset?.();
          }}
        >
          {dict.register.registerAnother}
        </Button>
      </div>
    );
  }

  const isPortal = variant === "portal";

  if (registrationDisabled && !issued) {
    return (
      <div
        className={cn(
          "flex w-full flex-col gap-4",
          isPortal
            ? "h-full min-w-0 max-w-full rounded-2xl border border-portal-outline-variant bg-white p-6 portal-card-shadow sm:p-8"
            : "max-w-md border border-vegalta-royal-blue/10 bg-white p-5 shadow-sm sm:p-6 md:p-8",
          className
        )}
        role="status"
      >
        <p className="text-sm leading-relaxed text-portal-on-surface-variant">
          {dict.register.disabledMessage}
        </p>
        <p className="text-xs leading-relaxed text-portal-on-surface-variant">
          {dict.register.disabledNote}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-5",
        isPortal
          ? "h-full min-w-0 max-w-full rounded-2xl border border-portal-outline-variant bg-white p-6 portal-card-shadow sm:p-8"
          : "max-w-md border border-vegalta-royal-blue/10 bg-white p-5 shadow-sm sm:p-6 md:p-8",
        className
      )}
    >
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="firstName" className="portal-label text-portal-on-surface">
          {dict.register.firstName}
        </Label>
        <Input
          id="firstName"
          autoComplete="given-name"
          className="rounded-lg border-portal-outline-variant focus-visible:ring-portal-primary"
          {...register("firstName")}
        />
        {errors.firstName && (
          <p className="text-xs text-vegalta-red">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName" className="portal-label text-portal-on-surface">
          {dict.register.lastName}
        </Label>
        <Input
          id="lastName"
          autoComplete="family-name"
          className="rounded-lg border-portal-outline-variant focus-visible:ring-portal-primary"
          {...register("lastName")}
        />
        {errors.lastName && (
          <p className="text-xs text-vegalta-red">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="portal-label text-portal-on-surface">
          {dict.register.email}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="rounded-lg border-portal-outline-variant focus-visible:ring-portal-primary"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-vegalta-red">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country" className="portal-label text-portal-on-surface">
          {dict.register.countryOptional}
        </Label>
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <CountrySelect
              id="country"
              value={field.value ?? ""}
              onChange={field.onChange}
              locale={locale}
              placeholder={dict.register.countryPlaceholder}
              searchPlaceholder={dict.register.countrySearch}
              emptyLabel={dict.register.countryNone}
              noResultsLabel={dict.register.countryNoResults}
            />
          )}
        />
        {errors.country && (
          <p className="text-xs text-vegalta-red">{errors.country.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Controller
          name="acceptPrivacy"
          control={control}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-portal-on-surface-variant">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                ref={field.ref}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-portal-outline-variant text-portal-primary focus:ring-portal-primary"
              />
              <span>
                {dict.register.privacyAcceptPrefix}{" "}
                <Link
                  href={`${localizedPath(locale)}/legal#privacidad`}
                  className="font-semibold text-portal-primary underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dict.register.privacyAcceptLink}
                </Link>
              </span>
            </label>
          )}
        />
        {errors.acceptPrivacy && (
          <p className="text-xs text-vegalta-red">
            {errors.acceptPrivacy.message}
          </p>
        )}
      </div>

      {pendingMessage && (
        <div className="space-y-2">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center text-sm text-emerald-800">
            {pendingMessage}
          </p>
          {pendingHint && (
            <p className="text-center text-xs leading-relaxed text-portal-on-surface-variant">
              {pendingHint}
            </p>
          )}
        </div>
      )}

      {submitError && (
        <p className="border border-vegalta-red/20 bg-vegalta-red/10 p-3 text-center text-sm text-vegalta-red">
          {submitError}
        </p>
      )}

      {turnstileSiteKey && (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onToken={setTurnstileToken}
          className="flex justify-center"
        />
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className={cn(
          "w-full portal-label rounded-lg",
          isPortal && "bg-portal-gold text-portal-gold-text hover:bg-portal-gold-light",
        )}
      >
        {isSubmitting ? dict.register.submitting : dict.register.submit}
      </Button>
    </form>

      <div className="space-y-3 text-center text-sm text-portal-on-surface-variant">
        <p>
          {dict.register.recoverPrompt}{" "}
          <button
            type="button"
            onClick={() => setShowRecover((value) => !value)}
            className="font-semibold text-portal-primary underline-offset-2 hover:underline"
          >
            {dict.register.recoverLink}
          </button>
        </p>
        {showRecover && <RecoverMemberForm />}
      </div>

      {!isPortal && (
        <p className="text-center text-xs leading-relaxed text-portal-on-surface-variant">
          {dict.register.disclaimer}
        </p>
      )}
    </div>
  );
}
