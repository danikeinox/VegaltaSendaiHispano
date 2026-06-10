import {
  findMemberByEmail,
  MemberAlreadyExistsError,
  registerMember,
  setMemberAccessToken,
} from "@/lib/members";
import { initiateMemberRecovery } from "@/lib/recovery-flow";
import { buildRegisterSuccessPayload } from "@/lib/register-response";
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
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/security/turnstile";
import {
  generateAccessToken,
  hashAccessToken,
} from "@/lib/verification";
import { isRegistrationDisabled } from "@/lib/registration-config";
import { getCountryName, isValidCountryCode } from "@/lib/countries";
import { getSchemasForRequest } from "@/i18n/schemas";
import { getLocaleFromRequest } from "@/i18n/get-locale-from-request";
import type { Locale } from "@/i18n/config";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

async function handleExistingEmail(
  email: string,
  locale: Locale,
  request: Request,
  message: string
) {
  const existing = await findMemberByEmail(email);
  if (existing) {
    try {
      await initiateMemberRecovery(existing, locale);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[register] recovery initiation failed", error);
      }
    }
  }

  return jsonSuccess({ pending: true, message }, 200, request);
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
    const body = await request.json();
    const data = registrationSchema.parse(body);
    const locale = getLocaleFromRequest(request);

    const rateLimit = await checkRegistrationRateLimit(`${ip}:${data.email}`);
    if (!rateLimit.success) {
      throw new ApiError(429, dict.api.rateLimited, "RATE_LIMITED");
    }

    if (isTurnstileConfigured()) {
      const turnstileToken =
        typeof body === "object" && body !== null && "turnstileToken" in body
          ? String((body as { turnstileToken?: string }).turnstileToken ?? "")
          : undefined;

      const turnstileValid = await verifyTurnstileToken(turnstileToken, ip);
      if (!turnstileValid) {
        throw new ApiError(403, dict.api.forbiddenOrigin, "TURNSTILE_FAILED");
      }
    }

    const countryCode = data.country?.trim();
    const country =
      countryCode && isValidCountryCode(countryCode)
        ? getCountryName(countryCode, locale)
        : undefined;

    const existingCheck = await findMemberByEmail(data.email);
    if (existingCheck) {
      return handleExistingEmail(
        data.email,
        locale,
        request,
        dict.api.existingMemberRecovery
      );
    }

    const dailyQuota = await checkDailyRegistrationQuota();
    if (!dailyQuota.success) {
      throw new ApiError(503, dict.api.dailyQuotaFull, "DAILY_QUOTA_FULL");
    }

    let member;
    try {
      member = await registerMember({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        country,
      });
    } catch (error) {
      if (error instanceof MemberAlreadyExistsError) {
        return handleExistingEmail(
          data.email,
          locale,
          request,
          dict.api.existingMemberRecovery
        );
      }
      throw error;
    }

    const accessToken = generateAccessToken();
    const tokenVersion = member.tokenVersion + 1;
    member = await setMemberAccessToken(
      member.id,
      hashAccessToken(accessToken),
      tokenVersion
    );

    return jsonSuccess(
      buildRegisterSuccessPayload(member, locale, accessToken),
      201,
      request
    );
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
