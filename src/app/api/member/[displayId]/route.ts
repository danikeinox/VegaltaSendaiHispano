import { findMemberByDisplayId } from "@/lib/members";
import { corsHeaders } from "@/lib/security/cors";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/security/error-handler";
import { memberLookupSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ displayId: string }> };

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { displayId: rawId } = await context.params;
    const { displayId } = memberLookupSchema.parse({ displayId: rawId });

    const member = await findMemberByDisplayId(displayId);

    if (!member) {
      throw new ApiError(404, "Socio no encontrado", "NOT_FOUND");
    }

    return jsonSuccess(
      {
        member: {
          displayId: member.displayId,
          firstName: member.firstName,
          lastName: member.lastName,
          country: member.country,
          createdAt: member.createdAt,
        },
      },
      200,
      request
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}
