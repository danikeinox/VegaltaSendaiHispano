import { describe, expect, it } from "vitest";
import {
  buildMonthGrid,
  groupFixturesByDate,
  toDateKey,
} from "@/lib/fixture-utils";
import type { SeasonFixture } from "@/lib/football-api";

describe("fixture-utils", () => {
  it("builds a 6-week month grid", () => {
    expect(buildMonthGrid(2026, 5)).toHaveLength(42);
  });

  it("groups fixtures by local date key", () => {
    const fixtures: SeasonFixture[] = [
      {
        id: 1,
        date: "2026-06-06T05:00:00.000Z",
        status: "FT",
        statusLong: "Match Finished",
        homeTeam: "Vegalta Sendai",
        awayTeam: "Kataller Toyama",
        homeGoals: 1,
        awayGoals: 1,
        isVegaltaHome: true,
      },
    ];

    const grouped = groupFixturesByDate(fixtures);
    expect(grouped.get(toDateKey("2026-06-06T05:00:00.000Z"))).toHaveLength(1);
  });
});
