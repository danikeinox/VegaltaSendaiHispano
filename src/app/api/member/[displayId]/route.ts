import { prisma } from "@/lib/prisma";
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

    const member = await prisma.member.findUnique({
      where: { displayId },
      select: {
        displayId: true,
        firstName: true,
        lastName: true,
        country: true,
        createdAt: true,
      },
    });

    if (!member) {
      throw new ApiError(404, "Socio no encontrado", "NOT_FOUND");
    }

    return jsonSuccess({ member }, 200, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
