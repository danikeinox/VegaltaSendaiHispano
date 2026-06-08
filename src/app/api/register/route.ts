import { registerMember } from "@/lib/members";
import { validateOrigin } from "@/lib/security/csrf";
import { corsHeaders } from "@/lib/security/cors";
import {
  ApiError,
  getClientIp,
  handleApiError,
  jsonSuccess,
} from "@/lib/security/error-handler";
import { checkRegistrationRateLimit } from "@/lib/security/rate-limit";
import { getSchemasForRequest } from "@/i18n/schemas";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const { dict, registrationSchema } = await getSchemasForRequest(request);

  try {
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
    const country = data.country?.trim() || undefined;

    const { member, isNew } = await registerMember({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      country,
    });

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
        isNew,
        wallet: {
          apple: `/api/wallet/apple?displayId=${encodeURIComponent(member.displayId)}`,
          google: `/api/wallet/google?displayId=${encodeURIComponent(member.displayId)}`,
        },
      },
      isNew ? 201 : 200,
      request
    );
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
