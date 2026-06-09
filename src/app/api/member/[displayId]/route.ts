import { findMemberByDisplayId } from "@/lib/members";
import { corsHeaders } from "@/lib/security/cors";
import { ApiError, handleApiError, jsonSuccess } from "@/lib/security/error-handler";
import { assertMemberAccess } from "@/lib/security/member-access";
import { getSchemasForRequest } from "@/i18n/schemas";

type RouteContext = { params: Promise<{ displayId: string }> };

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request, context: RouteContext) {
  const { dict, memberLookupSchema } = await getSchemasForRequest(request);

  try {
    const { displayId: rawId } = await context.params;
    const { displayId } = memberLookupSchema.parse({ displayId: rawId });
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    const member = await assertMemberAccess(
      request,
      await findMemberByDisplayId(displayId),
      token
    );

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
    return handleApiError(error, request, dict.api);
  }
}
