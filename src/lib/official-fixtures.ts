import type { SeasonFixture } from "@/lib/football-api";
import {
  JLEAGUE_ALLSTAR_2026_URL,
  VEGALTA_EMPEROR_CUP_MATCH_NEWS_URL,
} from "@/lib/site-links";

/** Partidos publicados en fuentes oficiales cuando las APIs externas van retrasadas. */
export const VEGALTA_OFFICIAL_FIXTURES: SeasonFixture[] = [
  {
    id: 9_100_003,
    date: "2026-06-06T05:00:00.000Z",
    status: "PEN",
    statusLong: "Match Finished",
    homeTeam: "Vegalta Sendai",
    awayTeam: "Kataller Toyama",
    homeGoals: 1,
    awayGoals: 1,
    round: "Centenario J2/J3 · Playoffs 2 · 4 PK 2",
    venue: "Yurtec Stadium Sendai",
    isVegaltaHome: true,
  },
  {
    id: 9_100_002,
    date: "2026-06-13T04:00:00.000Z",
    status: "NS",
    statusLong: "Not Started",
    homeTeam: "J2/J3 EAST-A",
    awayTeam: "J2/J3 EAST-B",
    homeGoals: null,
    awayGoals: null,
    round: "J.League All-Star DAZN Cup · 1ª ronda",
    venue: "MUFG Stadium (National Stadium), Tokyo",
    isVegaltaHome: true,
    infoUrl: JLEAGUE_ALLSTAR_2026_URL,
  },
  {
    id: 9_100_001,
    date: "2026-08-26T10:00:00.000Z",
    status: "NS",
    statusLong: "Not Started",
    homeTeam: "Vegalta Sendai",
    awayTeam: "Tochigi City",
    homeGoals: null,
    awayGoals: null,
    round: "Copa del Emperador · 2ª ronda",
    venue: "Yurtec Stadium Sendai",
    isVegaltaHome: true,
    infoUrl: VEGALTA_EMPEROR_CUP_MATCH_NEWS_URL,
  },
];

export function mergeOfficialFixtures(
  fixtures: SeasonFixture[]
): SeasonFixture[] {
  const byKey = new Map<string, SeasonFixture>();

  for (const fixture of [...fixtures, ...VEGALTA_OFFICIAL_FIXTURES]) {
    const key = `${fixture.date.slice(0, 10)}:${fixture.homeTeam}:${fixture.awayTeam}`;
    const existing = byKey.get(key);
    if (!existing || fixture.infoUrl) {
      byKey.set(key, fixture);
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}
