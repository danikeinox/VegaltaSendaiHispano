import { findMemberByDisplayId } from "@/lib/members";
import { buildMembershipCardSvg } from "@/lib/membership-card-svg";
import { corsHeaders } from "@/lib/security/cors";
import { ApiError, handleApiError } from "@/lib/security/error-handler";
import { assertMemberAccess } from "@/lib/security/member-access";
import { getSchemasForRequest } from "@/i18n/schemas";
import { getLocaleFromRequest } from "@/i18n/get-locale-from-request";
import { getDictionary } from "@/i18n/get-dictionary";

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request) {
  const { dict, memberLookupSchema } = await getSchemasForRequest(request);

  try {
    const { searchParams } = new URL(request.url);
    const displayIdParam = searchParams.get("displayId");
    const token = searchParams.get("token");

    if (!displayIdParam) {
      throw new ApiError(400, "displayId requerido", "MISSING_PARAM");
    }

    const { displayId } = memberLookupSchema.parse({ displayId: displayIdParam });
    const member = await assertMemberAccess(
      request,
      await findMemberByDisplayId(displayId),
      token
    );

    const locale = getLocaleFromRequest(request);
    const localeDict = await getDictionary(locale);

    const svg = buildMembershipCardSvg({
      displayId: member.displayId,
      firstName: member.firstName,
      lastName: member.lastName,
      officialCardLabel: localeDict.carnet.officialCard,
      logoHref: "/assets/branding/logo-hispano.svg",
      idPrefix: "export",
    });

    const headers = new Headers(corsHeaders(request));
    headers.set("Content-Type", "image/svg+xml; charset=utf-8");
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    return new Response(svg, { status: 200, headers });
  } catch (error) {
    return handleApiError(error, request, dict.api);
  }
}
