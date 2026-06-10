import jwt from "jsonwebtoken";
import { VEGALTA_COLORS } from "@/lib/constants";
import {
  buildMemberAccessQuery,
  createMemberVerificationUrl,
} from "@/lib/verification";
import { resolveSiteBaseUrl } from "@/lib/site-origin";

export type GooglePassMemberData = {
  id: string;
  displayId: string;
  firstName: string;
  lastName: string;
  email: string;
};

function getServiceAccount() {
  const email = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!email || !privateKey) return null;
  return { email, privateKey };
}

export function isGoogleWalletConfigured(): boolean {
  return (
    !!process.env.GOOGLE_WALLET_ISSUER_ID && getServiceAccount() !== null
  );
}

export function generateGoogleWalletSaveUrl(
  member: GooglePassMemberData
): string {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID ?? "vegalta_hispano_member";
  const account = getServiceAccount();

  if (!issuerId || !account) {
    throw new Error("Google Wallet not configured");
  }

  const objectId = `${issuerId}.${member.displayId.replace(/-/g, "_").toLowerCase()}`;
  const classSuffix = classId;
  const appUrl = resolveSiteBaseUrl();
  const verificationUrl = createMemberVerificationUrl("es", member);

  const genericClass = {
    id: `${issuerId}.${classSuffix}`,
    issuerName: "Vegalta Sendai Hispano",
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: VEGALTA_COLORS.deepBlue.replace("#", ""),
    logo: {
      sourceUri: {
        uri: `${appUrl}/api/wallet/assets/logo`,
      },
    },
  };

  const genericObject = {
    id: objectId,
    classId: `${issuerId}.${classSuffix}`,
    state: "ACTIVE",
    cardTitle: {
      defaultValue: { language: "es", value: "VEGALTA SENDAI" },
    },
    header: {
      defaultValue: {
        language: "es",
        value: `${member.firstName} ${member.lastName}`,
      },
    },
    subheader: {
      defaultValue: { language: "es", value: "Comunidad Hispana" },
    },
    barcode: {
      type: "QR_CODE",
      value: verificationUrl,
    },
    textModulesData: [
      {
        id: "member_id",
        header: "ID SOCIO",
        body: member.displayId,
      },
      {
        id: "disclaimer",
        header: "AVISO",
        body: "Carnet no oficial de la comunidad hispana. Sin fines de lucro.",
      },
    ],
    hexBackgroundColor: VEGALTA_COLORS.deepBlue.replace("#", ""),
  };

  const claims = {
    iss: account.email,
    aud: "google",
    origins: [appUrl],
    typ: "savetowallet",
    payload: {
      genericClasses: [genericClass],
      genericObjects: [genericObject],
    },
  };

  const token = jwt.sign(claims, account.privateKey, { algorithm: "RS256" });
  return `https://pay.google.com/gp/v/save/${token}`;
}

/** URL alternativa: descarga .pkpass compatible con apps Android universales */
export function getAndroidPkpassFallbackUrl(
  member: Pick<GooglePassMemberData, "displayId">,
  accessToken: string
): string {
  const appUrl = resolveSiteBaseUrl();
  return `${appUrl}/api/wallet/apple?${buildMemberAccessQuery(member, accessToken)}`;
}
