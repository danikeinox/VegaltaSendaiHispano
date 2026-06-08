"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaApple, FaGoogle } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MembershipCard } from "@/components/membership-card";
import {
  registrationSchema,
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
  const [result, setResult] = useState<RegisterResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Error al registrar");
        return;
      }

      setResult(json);

      const googleRes = await fetch(json.wallet.google);
      const googleJson = await googleRes.json();
      if (googleJson.saveUrl) {
        setGoogleUrl(googleJson.saveUrl);
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-8 w-full">
        <MembershipCard
          displayId={result.member.displayId}
          firstName={result.member.firstName}
          lastName={result.member.lastName}
        />

        <p className="text-center text-white/80 text-sm max-w-md">
          {result.isNew
            ? "¡Bienvenido a la comunidad! Tu carnet digital está listo."
            : "Ya tenías un carnet registrado con este correo."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <a
            href={result.wallet.apple}
            className="inline-flex flex-1 h-11 items-center justify-center gap-2 rounded-md bg-vegalta-blue text-white border border-vegalta-gold/30 hover:bg-vegalta-blue-light text-sm font-semibold transition-colors"
          >
            <FaApple className="text-lg" />
            Añadir a Apple Wallet
          </a>

          {googleUrl ? (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 h-11 items-center justify-center gap-2 rounded-md border-2 border-vegalta-gold text-vegalta-gold hover:bg-vegalta-gold/10 text-sm font-semibold transition-colors"
            >
              <FaGoogle className="text-lg" />
              Añadir a Google Wallet
            </a>
          ) : (
            <a
              href={result.wallet.apple}
              className="inline-flex flex-1 h-11 items-center justify-center gap-2 rounded-md border-2 border-vegalta-gold text-vegalta-gold hover:bg-vegalta-gold/10 text-sm font-semibold transition-colors"
            >
              <FaGoogle className="text-lg" />
              Descargar para Android
            </a>
          )}
        </div>

        <Button variant="ghost" onClick={() => setResult(null)}>
          Registrar otro socio
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 w-full max-w-md"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="firstName">Nombre</Label>
        <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-vegalta-red text-xs">{errors.firstName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Apellidos</Label>
        <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-vegalta-red text-xs">{errors.lastName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email && (
          <p className="text-vegalta-red text-xs">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">País (opcional)</Label>
        <Input id="country" autoComplete="country-name" {...register("country")} />
        {errors.country && (
          <p className="text-vegalta-red text-xs">{errors.country.message}</p>
        )}
      </div>

      {error && (
        <p className="text-vegalta-red text-sm text-center bg-red-900/30 rounded-md p-3">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Registrando..." : "Obtener mi carnet gratuito"}
      </Button>

      <p className="text-xs text-white/50 text-center leading-relaxed">
        Carnet digital no oficial de la comunidad hispana de fans del Vegalta Sendai.
        Sin fines de lucro. Tus datos se usan únicamente para generar tu carnet.
      </p>
    </form>
  );
}
