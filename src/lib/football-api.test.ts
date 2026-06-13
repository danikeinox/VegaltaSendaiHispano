import { describe, expect, it } from "vitest";
import {
  deriveMatchesFromSeason,
  getSeasonsToTry,
  type SeasonFixturesData,
} from "@/lib/football-api";

describe("getSeasonsToTry", () => {
  it("deduplicates and keeps requested season first", () => {
    const seasons = getSeasonsToTry("2026");
    expect(seasons[0]).toBe("2026");
    expect(new Set(seasons).size).toBe(seasons.length);
    expect(seasons).toContain("2024");
  });
});

describe("deriveMatchesFromSeason", () => {
  it("picks the latest finished and earliest upcoming fixtures", () => {
    const data: SeasonFixturesData = {
      season: "2024",
      requestedSeason: "2026",
      source: "api",
      provider: "api-football",
      updatedAt: "2026-01-01T00:00:00.000Z",
      fixtures: [
        {
          id: 1,
          date: "2024-03-01T05:00:00.000Z",
          status: "FT",
          statusLong: "Match Finished",
          homeTeam: "Vegalta Sendai",
          awayTeam: "Team A",
          homeGoals: 2,
          awayGoals: 0,
          isVegaltaHome: true,
        },
        {
          id: 2,
          date: "2024-04-01T05:00:00.000Z",
          status: "NS",
          statusLong: "Not Started",
          homeTeam: "Team B",
          awayTeam: "Vegalta Sendai",
          homeGoals: null,
          awayGoals: null,
          isVegaltaHome: false,
        },
      ],
    };

    const matches = deriveMatchesFromSeason(data);
    expect(matches.last?.awayTeam).toBe("TEAM A");
    expect(matches.next?.opponent).toBe("Team B");
    expect(matches.source).toBe("api");
  });
});
