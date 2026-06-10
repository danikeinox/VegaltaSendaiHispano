import type { Member } from "@/lib/members";
import { ApiError } from "@/lib/security/error-handler";
import { checkMemberLookupRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/error-handler";
import { verifyPrivateAccessToken } from "@/lib/verification";

export async function assertMemberAccess(
  request: Request,
  member: Member | null,
  token: string | null
): Promise<Member> {
  const ip = getClientIp(request);

  const rateLimit = await checkMemberLookupRateLimit(ip);
  if (!rateLimit.success) {
    throw new ApiError(429, "Demasiadas solicitudes", "RATE_LIMITED");
  }

  if (!member || !token || !verifyPrivateAccessToken(member, token)) {
    throw new ApiError(404, "Socio no encontrado", "NOT_FOUND");
  }

  return member;
}
