import type { SeasonFixture } from "@/lib/football-api";

const VEGALTA = "Vegalta Sendai";
const LEAGUE = "Centenario J2/J3";

/** JST 14:00 kickoff as default for curated league matches. */
function kickoff(isoDate: string): string {
  return `${isoDate}T05:00:00.000Z`;
}

function leagueFixture(
  id: number,
  isoDate: string,
  home: string,
  away: string,
  homeGoals: number,
  awayGoals: number,
  status: "FT" | "PEN" = "FT",
  round?: string
): SeasonFixture {
  return {
    id,
    date: kickoff(isoDate),
    status,
    statusLong: "Match Finished",
    homeTeam: home,
    awayTeam: away,
    homeGoals,
    awayGoals,
    round: round ?? LEAGUE,
    venue: home === VEGALTA ? "Yurtec Stadium Sendai" : undefined,
    isVegaltaHome: home === VEGALTA,
  };
}

/**
 * Temporada 2025/26 curada desde resultados públicos (p. ej. SofaScore).
 * Se complementa con APIs externas; no sustituye fuentes oficiales del club.
 */
export const VEGALTA_CURATED_SEASON_FIXTURES: SeasonFixture[] = [
  leagueFixture(9_200_001, "2025-11-23", "Blaublitz Akita", VEGALTA, 0, 0),
  leagueFixture(9_200_002, "2025-11-29", VEGALTA, "Iwaki FC", 0, 1),
  leagueFixture(
    9_200_003,
    "2026-01-24",
    VEGALTA,
    "FC Gifu",
    5,
    1,
    "FT",
    "Amistoso"
  ),
  leagueFixture(
    9_200_004,
    "2026-01-28",
    "Yokohama FC",
    VEGALTA,
    0,
    1,
    "FT",
    "Amistoso"
  ),
  leagueFixture(9_200_005, "2026-02-07", "Tochigi City", VEGALTA, 1, 4),
  leagueFixture(9_200_006, "2026-02-14", "Yokohama FC", VEGALTA, 0, 1),
  leagueFixture(9_200_007, "2026-02-22", "Tochigi SC", VEGALTA, 1, 2),
  leagueFixture(
    9_200_008,
    "2026-02-28",
    VEGALTA,
    "Hachinohe FC",
    0,
    0,
    "PEN",
    `${LEAGUE} · 5 PK 4`
  ),
  leagueFixture(
    9_200_009,
    "2026-03-07",
    VEGALTA,
    "Shonan Bellmare",
    1,
    1,
    "PEN",
    `${LEAGUE} · 4 PK 2`
  ),
  leagueFixture(9_200_010, "2026-03-14", VEGALTA, "SC Sagamihara", 3, 1),
  leagueFixture(9_200_011, "2026-03-22", "Montedio Yamagata", VEGALTA, 0, 1),
  leagueFixture(
    9_200_012,
    "2026-03-29",
    "Blaublitz Akita",
    VEGALTA,
    0,
    0,
    "PEN",
    `${LEAGUE} · 10 PK 11`
  ),
  leagueFixture(
    9_200_013,
    "2026-04-04",
    VEGALTA,
    "Thespakusatsu Gunma",
    2,
    2,
    "PEN",
    `${LEAGUE} · 8 PK 7`
  ),
  leagueFixture(9_200_014, "2026-04-12", "SC Sagamihara", VEGALTA, 0, 3),
  leagueFixture(9_200_015, "2026-04-18", VEGALTA, "Tochigi City", 5, 0),
  leagueFixture(9_200_016, "2026-04-25", VEGALTA, "Montedio Yamagata", 1, 0),
  leagueFixture(
    9_200_017,
    "2026-04-29",
    "Thespakusatsu Gunma",
    VEGALTA,
    1,
    3
  ),
  leagueFixture(9_200_018, "2026-05-02", VEGALTA, "Blaublitz Akita", 1, 3),
  leagueFixture(9_200_019, "2026-05-06", VEGALTA, "Tochigi SC", 2, 1),
  leagueFixture(
    9_200_020,
    "2026-05-10",
    "Hachinohe FC",
    VEGALTA,
    1,
    1,
    "PEN",
    `${LEAGUE} · 4 PK 5`
  ),
  leagueFixture(9_200_021, "2026-05-16", "Shonan Bellmare", VEGALTA, 0, 2),
  leagueFixture(9_200_022, "2026-05-23", VEGALTA, "Yokohama FC", 0, 3),
  leagueFixture(9_200_023, "2026-05-30", VEGALTA, "Ventforet Kofu", 1, 0),
];
