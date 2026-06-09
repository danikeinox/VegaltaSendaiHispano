import { absoluteUrl } from "@/lib/seo";
import { localizedPath } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

type RecoveryEmailContent = {
  subject: string;
  html: string;
};

function getRecoveryEmailContent(
  locale: Locale,
  recoveryUrl: string
): RecoveryEmailContent {
  if (locale === "jp") {
    return {
      subject: "ベガルタ仙台ヒスパーノ — 会員証の再取得",
      html: `
        <p>ベガルタ仙台ヒスパーノの会員証を再取得するリクエストを受け付けました。</p>
        <p>次のリンクから会員証にアクセスできます（30分間有効・1回限り）:</p>
        <p><a href="${recoveryUrl}">${recoveryUrl}</a></p>
        <p>心当たりがない場合は、このメールを無視してください。</p>
      `,
    };
  }

  return {
    subject: "Vegalta Sendai Hispano — Recuperar tu carnet",
    html: `
      <p>Has solicitado recuperar tu carnet de la comunidad Vegalta Sendai Hispano.</p>
      <p>Usa este enlace para acceder a tu carnet (válido 30 minutos, un solo uso):</p>
      <p><a href="${recoveryUrl}">${recoveryUrl}</a></p>
      <p>Si no solicitaste esto, ignora este correo.</p>
      <p><strong>No compartas este enlace con nadie.</strong></p>
    `,
  };
}

export function buildRecoveryUrl(locale: Locale, recoveryToken: string): string {
  return absoluteUrl(
    `${localizedPath(locale)}/recuperar/${encodeURIComponent(recoveryToken)}`
  );
}

export async function sendRecoveryEmail(params: {
  to: string;
  locale: Locale;
  recoveryToken: string;
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
  const { subject, html } = getRecoveryEmailContent(params.locale, recoveryUrl);

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
