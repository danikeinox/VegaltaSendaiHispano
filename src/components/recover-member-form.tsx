"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useLocale } from "@/components/locale-provider";
import { FIELD_LIMITS } from "@/lib/validations";

export function RecoverMemberForm() {
  const { locale, dict } = useLocale();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setHint(null);
    setError(null);

    if (turnstileSiteKey && !turnstileToken) {
      setError(dict.recover.requestError);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Locale": locale,
        },
        body: JSON.stringify({
          email,
          ...(turnstileSiteKey ? { turnstileToken } : {}),
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? dict.recover.requestError);
        return;
      }

      setMessage(json.message ?? dict.api.existingMemberRecovery);
      setHint(json.hint ?? dict.recover.emailNotice);
      setEmail("");
      setTurnstileToken(null);
    } catch {
      setError(dict.recover.connectionError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs leading-relaxed text-portal-on-surface-variant">
        {dict.recover.emailNotice}
      </p>

      <div className="space-y-2">
        <Label htmlFor="recover-email">{dict.recover.emailLabel}</Label>
        <Input
          id="recover-email"
          type="email"
          autoComplete="email"
          maxLength={FIELD_LIMITS.email}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      {turnstileSiteKey && (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onToken={setTurnstileToken}
        />
      )}

      {message && (
        <div className="space-y-2">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {message}
          </p>
          {hint && (
            <p className="text-xs leading-relaxed text-portal-on-surface-variant">
              {hint}
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-vegalta-red/20 bg-vegalta-red/10 p-3 text-sm text-vegalta-red">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? dict.recover.submitting : dict.recover.submit}
      </Button>
    </form>
  );
}
