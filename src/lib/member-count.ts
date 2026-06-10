import { countMembers } from "@/lib/members";

export async function getCachedMemberCount(): Promise<number | null> {
  try {
    return await countMembers();
  } catch {
    return null;
  }
}
