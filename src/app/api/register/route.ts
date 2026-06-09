import { findMemberByEmail, registerMember } from "@/lib/members";
import { validateOrigin } from "@/lib/security/csrf";
import { corsHeaders } from "@/lib/security/cors";
import {
  ApiError,
  getClientIp,
  handleApiError,
  jsonSuccess,
} from "@/lib/security/error-handler";
import {
  checkDailyRegistrationQuota,
  checkRegistrationRateLimit,
} from "@/lib/security/rate-limit";
import { isAppleWalletConfigured } from "@/lib/wallet/apple-pass";
import { isGoogleWalletConfigured } from "@/lib/wallet/google-wallet";
import { getCountryName, isValidCountryCode } from "@/lib/countries";
import {
  buildMemberAccessQuery,
  createMemberCarnetUrl,
  createMemberVerificationUrl,
} from "@/lib/verification";
import { isRegistrationDisabled } from "@/lib/registration-config";
import { getSchemasForRequest } from "@/i18n/schemas";
import { getLocaleFromRequest } from "@/i18n/get-locale-from-request";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const { dict, registrationSchema } = await getSchemasForRequest(request);

  try {
    if (isRegistrationDisabled()) {
      throw new ApiError(
        503,
        dict.api.registrationDisabled,
        "REGISTRATION_DISABLED"
      );
    }

    if (!validateOrigin(request)) {
      throw new ApiError(403, dict.api.forbiddenOrigin, "FORBIDDEN_ORIGIN");
    }

    const ip = getClientIp(request);
    const rateLimit = await checkRegistrationRateLimit(ip);

    if (!rateLimit.success) {
      throw new ApiError(429, dict.api.rateLimited, "RATE_LIMITED");
    }

    const body = await request.json();
    const data = registrationSchema.parse(body);
    const locale = getLocaleFromRequest(request);
    const countryCode = data.country?.trim();
    const country =
      countryCode && isValidCountryCode(countryCode)
        ? getCountryName(countryCode, locale)
        : undefined;

    const dailyQuota = await checkDailyRegistrationQuota();
    const existingCheck = await findMemberByEmail(data.email);

    if (!existingCheck && !dailyQuota.success) {
      throw new ApiError(503, dict.api.dailyQuotaFull, "DAILY_QUOTA_FULL");
    }

    const { member, isNew } = await registerMember({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country,
    });

    const appleConfigured = isAppleWalletConfigured();
    const googleConfigured = isGoogleWalletConfigured();
    const accessQuery = buildMemberAccessQuery(member);
    const verificationUrl = createMemberVerificationUrl(locale, member);
    const carnetUrl = createMemberCarnetUrl(locale, member);

    return jsonSuccess(
      {
        member: {
          displayId: member.displayId,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          country: member.country,
          createdAt: member.createdAt,
        },
        verification: {
          url: verificationUrl,
        },
        carnet: {
          url: carnetUrl,
        },
        isNew,
        wallet: {
          apple: appleConfigured ? `/api/wallet/apple?${accessQuery}` : null,
          google: googleConfigured ? `/api/wallet/google?${accessQuery}` : null,
        },
        walletAvailable: {
          apple: appleConfigured,
          google: googleConfigured,
        },
      },
      isNew ? 201 : 200,
      request
    );
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
