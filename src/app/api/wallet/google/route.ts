import { findMemberByDisplayId } from "@/lib/members";
import { corsHeaders } from "@/lib/security/cors";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/security/error-handler";
import {
  generateGoogleWalletSaveUrl,
  getAndroidPkpassFallbackUrl,
  isGoogleWalletConfigured,
} from "@/lib/wallet/google-wallet";
import { memberLookupSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const displayId = searchParams.get("displayId");

    if (!displayId) {
      throw new ApiError(400, "displayId requerido", "MISSING_PARAM");
    }

    const parsed = memberLookupSchema.parse({ displayId });

    const member = await findMemberByDisplayId(parsed.displayId);

    if (!member) {
      throw new ApiError(404, "Socio no encontrado", "NOT_FOUND");
    }

    if (!isGoogleWalletConfigured()) {
      return jsonSuccess(
        {
          configured: false,
          fallback: {
            type: "pkpass",
            url: getAndroidPkpassFallbackUrl(member.displayId),
            message:
              "Google Wallet API no configurada. Usa la descarga .pkpass compatible con apps Android.",
          },
        },
        200,
        request
      );
    }

    const saveUrl = generateGoogleWalletSaveUrl({
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
    return handleApiError(error, request);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = memberLookupSchema.parse(body);

    const member = await findMemberByDisplayId(parsed.displayId);

    if (!member) {
      throw new ApiError(404, "Socio no encontrado", "NOT_FOUND");
    }

    if (!isGoogleWalletConfigured()) {
      return jsonSuccess(
        {
          configured: false,
          fallback: {
            type: "pkpass",
            url: getAndroidPkpassFallbackUrl(member.displayId),
          },
        },
        200,
        request
      );
    }

    const saveUrl = generateGoogleWalletSaveUrl({
      displayId: member.displayId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
    });

    return jsonSuccess({ configured: true, saveUrl }, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
