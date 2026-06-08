import { findMemberByDisplayId } from "@/lib/members";
import { corsHeaders } from "@/lib/security/cors";
import { ApiError, handleApiError } from "@/lib/security/error-handler";
import {
  generateApplePass,
  isAppleWalletConfigured,
} from "@/lib/wallet/apple-pass";
import { getSchemasForRequest } from "@/i18n/schemas";

export async function GET(request: Request) {
  const { dict, memberLookupSchema } = await getSchemasForRequest(request);

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

    if (!isAppleWalletConfigured()) {
      throw new ApiError(
        503,
        "Apple Wallet no configurado. Consulta docs/WALLET_SETUP.md",
        "WALLET_NOT_CONFIGURED"
      );
    }

    const buffer = await generateApplePass({
      displayId: member.displayId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      memberNumber: member.memberNumber,
    });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        ...corsHeaders(request),
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${member.displayId}.pkpass"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
