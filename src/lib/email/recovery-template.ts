import { VEGALTA_COLORS } from "@/lib/constants";
import type { Locale } from "@/i18n/config";

type RecoveryEmailParams = {
  locale: Locale;
  recoveryUrl: string;
  firstName: string;
  displayId: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildRecoveryEmailContent(params: RecoveryEmailParams): {
  subject: string;
  html: string;
} {
  const { locale, recoveryUrl, firstName, displayId } = params;
  const safeName = escapeHtml(firstName);
  const safeId = escapeHtml(displayId);
  const safeUrl = escapeHtml(recoveryUrl);

  const copy =
    locale === "jp"
      ? {
          subject: "ベガルタ仙台ヒスパーノ — 会員証の再取得",
          preheader: `${safeName}さん、会員証 ${safeId} へのアクセス`,
          greeting: `${safeName} さん、`,
          intro:
            "ベガルタ仙台ヒスパーノの会員証を再取得するリクエストを受け付けました。",
          memberLine: `会員ID: ${safeId}`,
          cta: "再取得を確認する",
          expiry: "このリンクは30分間有効で、1回のみ使用できます。",
          ignore: "心当たりがない場合は、このメールを無視してください。",
          footer:
            "非公式ファンコミュニティ · 営利目的なし · vegalta.es",
        }
      : {
          subject: "Vegalta Sendai Hispano — Recuperar tu carnet",
          preheader: `${safeName}, accede a tu carnet ${safeId}`,
          greeting: `Hola ${safeName},`,
          intro:
            "Has solicitado recuperar tu carnet de la comunidad Vegalta Sendai Hispano.",
          memberLine: `ID de socio: ${safeId}`,
          cta: "Confirmar recuperación",
          expiry:
            "El enlace es válido 30 minutos y solo puede usarse una vez.",
          ignore: "Si no solicitaste esto, ignora este correo.",
          footer:
            "Comunidad fan no oficial · Sin fines de lucro · vegalta.es",
        };

  const html = `<!DOCTYPE html>
<html lang="${locale === "jp" ? "ja" : "es"}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1f6;font-family:Segoe UI,Helvetica Neue,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef1f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,45,92,0.12);">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg, ${VEGALTA_COLORS.red} 0%, ${VEGALTA_COLORS.gold} 50%, ${VEGALTA_COLORS.red} 100%);"></td>
          </tr>
          <tr>
            <td style="padding:28px 28px 20px;background:linear-gradient(135deg, ${VEGALTA_COLORS.deepBlue} 0%, ${VEGALTA_COLORS.royalBlue} 100%);color:#ffffff;">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${VEGALTA_COLORS.goldLight};font-weight:700;">
                Vegalta Sendai Hispano
              </p>
              <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-0.02em;">
                ${locale === "jp" ? "会員証の再取得" : "Recuperar tu carnet"}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;color:#1a2b4a;font-size:15px;line-height:1.65;">
              <p style="margin:0 0 12px;font-weight:600;">${copy.greeting}</p>
              <p style="margin:0 0 16px;">${copy.intro}</p>
              <p style="margin:0 0 24px;padding:12px 16px;background-color:#f4f6fa;border-left:4px solid ${VEGALTA_COLORS.gold};border-radius:8px;font-size:14px;">
                <strong style="color:${VEGALTA_COLORS.deepBlue};">${copy.memberLine}</strong>
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:10px;background-color:${VEGALTA_COLORS.gold};">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;color:${VEGALTA_COLORS.deepBlue};">
                      ${copy.cta}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:13px;color:#5a6478;">${copy.expiry}</p>
              <p style="margin:0;font-size:13px;color:#5a6478;">${copy.ignore}</p>
              <p style="margin:16px 0 0;font-size:12px;color:#8a93a5;word-break:break-all;">
                <a href="${safeUrl}" style="color:${VEGALTA_COLORS.royalBlue};">${safeUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid #e5e9f0;text-align:center;font-size:11px;color:#8a93a5;line-height:1.5;">
              ${copy.footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: copy.subject, html };
}
