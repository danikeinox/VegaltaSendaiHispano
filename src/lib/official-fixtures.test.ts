import { describe, expect, it } from "vitest";
import { mergeOfficialFixtures } from "@/lib/official-fixtures";

describe("mergeOfficialFixtures", () => {
  it("adds the official Emperor's Cup fixture", () => {
    const merged = mergeOfficialFixtures([]);
    expect(merged.some((fixture) => fixture.awayTeam === "Tochigi City")).toBe(
      true
    );
  });
});
