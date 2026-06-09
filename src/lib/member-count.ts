import { unstable_cache } from "next/cache";
import { countMembers } from "@/lib/members";

const REVALIDATE_SECONDS = 60 * 60;

const getCachedCount = unstable_cache(
  async () => countMembers(),
  ["vegalta-member-count"],
  { revalidate: REVALIDATE_SECONDS }
);

export async function getCachedMemberCount(): Promise<number | null> {
  try {
    return await getCachedCount();
  } catch {
    return null;
  }
}
