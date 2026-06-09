"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CountrySelect } from "@/components/country-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MemberQrCode } from "@/components/member-qr-code";
import { MembershipCard } from "@/components/membership-card";
import { SupportCallout } from "@/components/support-callout";
import { WalletButtons } from "@/components/wallet-buttons";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";
import {
  createRegistrationSchema,
  type RegistrationInput,
} from "@/lib/validations";

type RegisterResponse = {
  member: {
    displayId: string;
    firstName: string;
    lastName: string;
    email: string;
    country: string | null;
  };
  isNew: boolean;
  wallet: {
    apple: string | null;
    google: string | null;
  };
  walletAvailable: {
    apple: boolean;
    google: boolean;
  };
  verification: {
    url: string;
  };
};

type RegistrationFormProps = {
  variant?: "default" | "portal";
  onPreviewNameChange?: (name: string) => void;
  className?: string;
};

export function RegistrationForm({
  variant = "default",
  onPreviewNameChange,
  className,
}: RegistrationFormProps) {
  const { locale, dict } = useLocale();
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);

  const registrationSchema = useMemo(
    () => createRegistrationSchema(dict.validation),
    [dict.validation]
  );

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { country: "" },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  useEffect(() => {
    if (!onPreviewNameChange) return;
    onPreviewNameChange(`${firstName ?? ""} ${lastName ?? ""}`.trim());
  }, [firstName, lastName, onPreviewNameChange]);

  async function onSubmit(data: RegistrationInput) {
    setError(null);
    setResult(null);
    setGoogleUrl(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Locale": locale,
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? dict.register.registerError);
        return;
      }

      setResult(json);

      if (json.wallet.google) {
        const googleRes = await fetch(json.wallet.google, {
          headers: { "X-Locale": locale },
        });
        const googleJson = await googleRes.json();
        if (googleJson.saveUrl) {
          setGoogleUrl(googleJson.saveUrl);
        }
      }
    } catch {
      setError(dict.register.connectionError);
    }
  }

  if (result) {
    return (
      <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
        <MembershipCard
          displayId={result.member.displayId}
          firstName={result.member.firstName}
          lastName={result.member.lastName}
          officialCardLabel={dict.carnet.officialCard}
        />

        <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-portal-outline-variant bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-portal-on-surface-variant">
            {dict.verification.qrLabel}
          </p>
          <MemberQrCode
            url={result.verification.url}
            size={128}
            label={dict.verification.qrLabel}
          />
          <p className="text-xs text-portal-on-surface-variant">
            {dict.verification.qrHint}
          </p>
        </div>

        <p className="max-w-md text-center text-sm text-portal-on-surface-variant">
          {result.isNew
            ? dict.register.welcomeNew
            : dict.register.welcomeExisting}
        </p>

        <WalletButtons
          appleUrl={result.wallet.apple}
          googleUrl={result.wallet.google}
          googleSaveUrl={googleUrl}
          appleLabel={dict.register.addAppleWallet}
          googleLabel={dict.register.addGoogleWallet}
          androidLabel={dict.register.downloadAndroid}
          appleAvailable={result.walletAvailable.apple}
          googleAvailable={result.walletAvailable.google}
          appleUnavailableNote={dict.register.appleUnavailable}
        />

        {!result.walletAvailable.apple && (
          <SupportCallout showAppleNote className="mx-auto" />
        )}

        <Button variant="ghost" onClick={() => setResult(null)}>
          {dict.register.registerAnother}
        </Button>
      </div>
    );
  }

  const isPortal = variant === "portal";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex w-full flex-col gap-5",
        isPortal
          ? "h-full min-w-0 max-w-full rounded-2xl border border-portal-outline-variant bg-white p-6 portal-card-shadow sm:p-8"
          : "max-w-md border border-vegalta-royal-blue/10 bg-white p-5 shadow-sm sm:p-6 md:p-8",
        className
      )}
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

      {error && (
        <p className="border border-vegalta-red/20 bg-vegalta-red/10 p-3 text-center text-sm text-vegalta-red">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className={cn(
          "w-full portal-label rounded-lg",
          isPortal && "mt-auto bg-portal-gold text-portal-gold-text hover:bg-portal-gold-light",
        )}
      >
        {isSubmitting ? dict.register.submitting : dict.register.submit}
      </Button>

      {!isPortal && (
        <p className="text-center text-xs leading-relaxed text-portal-on-surface-variant">
          {dict.register.disclaimer}
        </p>
      )}
    </form>
  );
}
