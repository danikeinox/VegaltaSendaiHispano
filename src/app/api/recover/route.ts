import { findMemberByEmail } from "@/lib/members";
import { initiateMemberRecovery } from "@/lib/recovery-flow";
import { validateOrigin } from "@/lib/security/csrf";
import { corsHeaders } from "@/lib/security/cors";
import {
  ApiError,
  getClientIp,
  handleApiError,
  jsonSuccess,
} from "@/lib/security/error-handler";
import {
  checkRecoveryIpRateLimit,
  checkRecoveryRateLimit,
} from "@/lib/security/rate-limit";
import { requireTurnstileForRequest } from "@/lib/security/turnstile";
import { isRegistrationDisabled } from "@/lib/registration-config";
import { getSchemasForRequest } from "@/i18n/schemas";
import { getLocaleFromRequest } from "@/i18n/get-locale-from-request";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const { dict, recoverEmailSchema } = await getSchemasForRequest(request);

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
    const { email } = recoverEmailSchema.parse(body);
    const locale = getLocaleFromRequest(request);

    const ipLimit = await checkRecoveryIpRateLimit(ip);
    if (!ipLimit.success) {
      throw new ApiError(429, dict.api.recoveryRateLimited, "RATE_LIMITED");
    }

    const rateLimit = await checkRecoveryRateLimit(`${ip}:${email}`);
    if (!rateLimit.success) {
      throw new ApiError(429, dict.api.recoveryRateLimited, "RATE_LIMITED");
    }

    await requireTurnstileForRequest(body, ip, {
      serviceUnavailable: dict.api.registrationDisabled,
      verificationFailed: dict.api.turnstileFailed,
    });

    const member = await findMemberByEmail(email);
    if (member) {
      try {
        await initiateMemberRecovery(member, locale);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[recover] failed to initiate recovery", error);
        }
      }
    }

    return jsonSuccess(
      {
        pending: true,
        message: dict.api.existingMemberRecovery,
        hint: dict.recover.emailNotice,
      },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
