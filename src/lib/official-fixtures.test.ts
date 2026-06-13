import { describe, expect, it } from "vitest";
import { mergeOfficialFixtures } from "@/lib/official-fixtures";

describe("mergeOfficialFixtures", () => {
  it("adds official fixtures when APIs have no data", () => {
    const merged = mergeOfficialFixtures([]);
    expect(merged.some((fixture) => fixture.awayTeam === "Tochigi City")).toBe(
      true
    );
    expect(
      merged.some(
        (fixture) =>
          fixture.homeTeam === "J2/J3 EAST-A" &&
          fixture.awayTeam === "J2/J3 EAST-B"
      )
    ).toBe(true);
  });

  it("sorts fixtures chronologically", () => {
    const merged = mergeOfficialFixtures([]);
    const dates = merged.map((fixture) => new Date(fixture.date).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it("includes the latest Kataller Toyama result", () => {
    const merged = mergeOfficialFixtures([]);
    expect(
      merged.some(
        (fixture) =>
          fixture.awayTeam === "Kataller Toyama" &&
          fixture.homeGoals === 1 &&
          fixture.awayGoals === 1
      )
    ).toBe(true);
  });
});
