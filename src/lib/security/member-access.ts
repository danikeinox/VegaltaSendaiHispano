import type { Member } from "@/lib/members";
import { ApiError } from "@/lib/security/error-handler";
import { checkMemberLookupRateLimit } from "@/lib/security/rate-limit";
import { verifyMemberToken } from "@/lib/verification";

export async function assertMemberAccess(
  request: Request,
  member: Member | null,
  token: string | null
): Promise<Member> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const rateLimit = await checkMemberLookupRateLimit(ip);
  if (!rateLimit.success) {
    throw new ApiError(429, "Demasiadas solicitudes", "RATE_LIMITED");
  }

  if (!member || !token || !verifyMemberToken(member, token)) {
    throw new ApiError(404, "Socio no encontrado", "NOT_FOUND");
  }

  return member;
}
