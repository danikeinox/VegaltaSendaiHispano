"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembershipCard } from "@/components/membership-card";
import { WalletButtons } from "@/components/wallet-buttons";
import { useLocale } from "@/components/locale-provider";
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
};

export function RegistrationForm() {
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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { country: "" },
  });

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

        <p className="max-w-md text-center text-sm text-vegalta-blue/70">
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

        <Button variant="ghost" onClick={() => setResult(null)}>
          {dict.register.registerAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-md flex-col gap-5 border border-vegalta-royal-blue/10 bg-white p-5 shadow-sm sm:p-6 md:p-8"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="firstName">{dict.register.firstName}</Label>
        <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-xs text-vegalta-red">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">{dict.register.lastName}</Label>
        <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-xs text-vegalta-red">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{dict.register.email}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-vegalta-red">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">{dict.register.countryOptional}</Label>
        <Input id="country" autoComplete="country-name" {...register("country")} />
        {errors.country && (
          <p className="text-xs text-vegalta-red">{errors.country.message}</p>
        )}
      </div>

      {error && (
        <p className="border border-vegalta-red/20 bg-vegalta-red/10 p-3 text-center text-sm text-vegalta-red">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? dict.register.submitting : dict.register.submit}
      </Button>

      <p className="text-center text-xs leading-relaxed text-vegalta-blue/50">
        {dict.register.disclaimer}
      </p>
    </form>
  );
}
