import { findMemberByDisplayId } from "@/lib/members";
import { corsHeaders } from "@/lib/security/cors";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/security/error-handler";
import { assertMemberAccess } from "@/lib/security/member-access";
import {
  generateGoogleWalletSaveUrl,
  getAndroidPkpassFallbackUrl,
  isGoogleWalletConfigured,
} from "@/lib/wallet/google-wallet";
import { getSchemasForRequest } from "@/i18n/schemas";

export async function GET(request: Request) {
  const { dict, memberLookupSchema } = await getSchemasForRequest(request);

  try {
    const { searchParams } = new URL(request.url);
    const displayId = searchParams.get("displayId");
    const token = searchParams.get("token");

    if (!displayId) {
      throw new ApiError(400, "displayId requerido", "MISSING_PARAM");
    }

    const parsed = memberLookupSchema.parse({ displayId });
    const member = await assertMemberAccess(
      request,
      await findMemberByDisplayId(parsed.displayId),
      token
    );

    if (!isGoogleWalletConfigured()) {
      return jsonSuccess(
        {
          configured: false,
          fallback: {
            type: "pkpass",
            url: getAndroidPkpassFallbackUrl(member),
            message:
              "Google Wallet API no configurada. Usa la descarga .pkpass compatible con apps Android.",
          },
        },
        200,
        request
      );
    }

    const saveUrl = generateGoogleWalletSaveUrl({
      id: member.id,
      displayId: member.displayId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    });

    return jsonSuccess(
      {
        configured: true,
        saveUrl,
      },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}

export async function POST(request: Request) {
  const { dict, memberLookupSchema } = await getSchemasForRequest(request);

  try {
    const body = await request.json();
    const parsed = memberLookupSchema.parse(body);
    const token =
      typeof body === "object" && body !== null && "token" in body
        ? String((body as { token?: string }).token ?? "")
        : null;

    const member = await assertMemberAccess(
      request,
      await findMemberByDisplayId(parsed.displayId),
      token
    );

    if (!isGoogleWalletConfigured()) {
      return jsonSuccess(
        {
          configured: false,
          fallback: {
            type: "pkpass",
            url: getAndroidPkpassFallbackUrl(member),
          },
        },
        200,
        request
      );
    }

    const saveUrl = generateGoogleWalletSaveUrl({
      id: member.id,
      displayId: member.displayId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    });

    return jsonSuccess({ configured: true, saveUrl }, 200, request);
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
