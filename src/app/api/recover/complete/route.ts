import { z } from "zod";
import { completeMemberRecovery } from "@/lib/recovery-flow";
import { validateOrigin } from "@/lib/security/csrf";
import { corsHeaders } from "@/lib/security/cors";
import {
  ApiError,
  getClientIp,
  handleApiError,
  jsonSuccess,
} from "@/lib/security/error-handler";
import { checkMemberLookupRateLimit } from "@/lib/security/rate-limit";
import { isRegistrationDisabled } from "@/lib/registration-config";
import { getSchemasForRequest } from "@/i18n/schemas";
import { getLocaleFromRequest } from "@/i18n/get-locale-from-request";

const completeSchema = z.object({
  token: z.string().trim().min(16).max(128),
});

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const { dict } = await getSchemasForRequest(request);

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
    const rateLimit = await checkMemberLookupRateLimit(ip);
    if (!rateLimit.success) {
      throw new ApiError(429, dict.api.rateLimited, "RATE_LIMITED");
    }

    const body = await request.json();
    const { token } = completeSchema.parse(body);
    const locale = getLocaleFromRequest(request);

    const result = await completeMemberRecovery(token, locale);
    if (!result) {
      throw new ApiError(404, dict.api.recoveryInvalid, "RECOVERY_INVALID");
    }

    return jsonSuccess(result, 200, request);
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
