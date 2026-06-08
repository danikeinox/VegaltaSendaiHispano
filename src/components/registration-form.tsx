"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaApple, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembershipCard } from "@/components/membership-card";
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
    apple: string;
    google: string;
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

      const googleRes = await fetch(json.wallet.google, {
        headers: { "X-Locale": locale },
      });
      const googleJson = await googleRes.json();
      if (googleJson.saveUrl) {
        setGoogleUrl(googleJson.saveUrl);
      }
    } catch {
      setError(dict.register.connectionError);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
        <MembershipCard
          displayId={result.member.displayId}
          firstName={result.member.firstName}
          lastName={result.member.lastName}
          officialCardLabel={dict.carnet.officialCard}
        />

        <p className="text-center text-vegalta-blue/70 text-sm max-w-md">
          {result.isNew
            ? dict.register.welcomeNew
            : dict.register.welcomeExisting}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <a
            href={result.wallet.apple}
            className="inline-flex flex-1 h-11 items-center justify-center gap-2 bg-vegalta-royal-blue text-white hover:bg-vegalta-blue-light text-xs vegalta-section-title tracking-wider transition-colors"
          >
            <FaApple className="text-lg" />
            {dict.register.addAppleWallet}
          </a>

          {googleUrl ? (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 h-11 items-center justify-center gap-2 border-2 border-vegalta-royal-blue text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 text-xs vegalta-section-title tracking-wider transition-colors bg-white"
            >
              <FaGoogle className="text-lg" />
              {dict.register.addGoogleWallet}
            </a>
          ) : (
            <a
              href={result.wallet.apple}
              className="inline-flex flex-1 h-11 items-center justify-center gap-2 border-2 border-vegalta-royal-blue text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 text-xs vegalta-section-title tracking-wider transition-colors bg-white"
            >
              <FaGoogle className="text-lg" />
              {dict.register.downloadAndroid}
            </a>
          )}
        </div>

        <Button variant="ghost" onClick={() => setResult(null)}>
          {dict.register.registerAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 w-full max-w-md bg-white border border-vegalta-royal-blue/10 shadow-sm p-5 sm:p-6 md:p-8"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="firstName">{dict.register.firstName}</Label>
        <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-vegalta-red text-xs">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">{dict.register.lastName}</Label>
        <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-vegalta-red text-xs">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{dict.register.email}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-vegalta-red text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">{dict.register.countryOptional}</Label>
        <Input id="country" autoComplete="country-name" {...register("country")} />
        {errors.country && (
          <p className="text-vegalta-red text-xs">{errors.country.message}</p>
        )}
      </div>

      {error && (
        <p className="text-vegalta-red text-sm text-center bg-vegalta-red/10 border border-vegalta-red/20 p-3">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? dict.register.submitting : dict.register.submit}
      </Button>

      <p className="text-xs text-vegalta-blue/50 text-center leading-relaxed">
        {dict.register.disclaimer}
      </p>
    </form>
  );
}
