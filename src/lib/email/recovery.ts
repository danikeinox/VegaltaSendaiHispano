import { buildRecoveryEmailContent } from "@/lib/email/recovery-template";
import { absoluteUrl } from "@/lib/seo";
import { localizedPath } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

export function buildRecoveryUrl(locale: Locale, recoveryToken: string): string {
  return absoluteUrl(
    `${localizedPath(locale)}/recuperar/${encodeURIComponent(recoveryToken)}`
  );
}

export async function sendRecoveryEmail(params: {
  to: string;
  locale: Locale;
  recoveryToken: string;
  firstName: string;
  displayId: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RECOVERY_EMAIL_FROM?.trim() ?? "Vegalta Hispano <noreply@vegalta.es>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      const url = buildRecoveryUrl(params.locale, params.recoveryToken);
      console.info("[recovery] RESEND_API_KEY not set. Recovery URL:", url);
    }
    return false;
  }

  const recoveryUrl = buildRecoveryUrl(params.locale, params.recoveryToken);
  const { subject, html } = buildRecoveryEmailContent({
    locale: params.locale,
    recoveryUrl,
    firstName: params.firstName,
    displayId: params.displayId,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    console.error("[recovery] Failed to send email:", response.status);
    return false;
  }

  return true;
}
