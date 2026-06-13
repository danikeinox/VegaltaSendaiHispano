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
          date: "2030-04-01T05:00:00.000Z",
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

  it("derives last and next from official fixtures when APIs fail", () => {
    const data: SeasonFixturesData = {
      season: "2026",
      requestedSeason: "2026",
      source: "fallback",
      provider: "none",
      updatedAt: "2026-01-01T00:00:00.000Z",
      fixtures: [
        {
          id: 9_100_003,
          date: "2026-06-06T05:00:00.000Z",
          status: "PEN",
          statusLong: "Match Finished",
          homeTeam: "Vegalta Sendai",
          awayTeam: "Kataller Toyama",
          homeGoals: 1,
          awayGoals: 1,
          isVegaltaHome: true,
        },
        {
          id: 9_100_005,
          date: "2030-06-13T10:35:00.000Z",
          status: "NS",
          statusLong: "Not Started",
          homeTeam: "J2/J3 EAST-A",
          awayTeam: "J2/J3 WEST-B",
          homeGoals: null,
          awayGoals: null,
          isVegaltaHome: true,
          round: "J.League All-Star DAZN Cup · Final",
        },
      ],
    };

    const matches = deriveMatchesFromSeason(data);
    expect(matches.last?.awayTeam).toBe("KATALLER TOYAMA");
    expect(matches.next?.opponent).toBe("J2/J3 WEST-B");
    expect(matches.next?.round).toContain("Final");
    expect(matches.source).toBe("api");
  });

  it("returns null matches when there is no data", () => {
    const data: SeasonFixturesData = {
      season: "2026",
      requestedSeason: "2026",
      source: "fallback",
      provider: "none",
      updatedAt: "2026-01-01T00:00:00.000Z",
      fixtures: [],
    };

    const matches = deriveMatchesFromSeason(data);
    expect(matches.last).toBeNull();
    expect(matches.next).toBeNull();
  });

  it("does not treat stale not-started fixtures as upcoming", () => {
    const data: SeasonFixturesData = {
      season: "2024",
      requestedSeason: "2026",
      source: "api",
      provider: "api-football",
      updatedAt: "2026-01-01T00:00:00.000Z",
      fixtures: [
        {
          id: 1,
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
    expect(matches.next).toBeNull();
  });
});
