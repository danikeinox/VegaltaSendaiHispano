import type { SeasonFixture } from "@/lib/football-api";
import { JLEAGUE_GAME_URL } from "@/lib/site-links";

export const JLEAGUE_LIVE_CACHE_KEY = "football:jleague:live:v1";
export const JLEAGUE_PERSISTED_KEY = "football:jleague:persisted:v1";
export const JLEAGUE_LIVE_TTL_SECONDS = 300;

export type JLeagueParsedPage = {
  pageDate: string;
  matches: SeasonFixture[];
};

const TEAM_ALIASES: Record<string, string> = {
  "J2・J3 EAST-A": "J2/J3 EAST-A",
  "J2・J3 EAST-B": "J2/J3 EAST-B",
  "J2・J3 WEST-A": "J2/J3 WEST-A",
  "J2・J3 WEST-B": "J2/J3 WEST-B",
  "J1 EAST": "J1 EAST",
  "J1 WEST": "J1 WEST",
  ベガルタ仙台: "Vegalta Sendai",
};

const VENUE_ALIASES: Record<string, string> = {
  "MUFG国立": "MUFG Stadium (National Stadium), Tokyo",
};

function decodeHtml(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function normalizeTeamName(raw: string): string {
  const cleaned = decodeHtml(raw).replace(/\s+/g, " ");
  return TEAM_ALIASES[cleaned] ?? cleaned.replace(/・/g, "/");
}

function parseClubNameCell(cellHtml: string): string {
  const spanMatch = cellHtml.match(/<span[^>]*>([^<]+)<\/span>/);
  if (spanMatch?.[1]) {
    return normalizeTeamName(spanMatch[1]);
  }
  return normalizeTeamName(cellHtml.replace(/<[^>]+>/g, ""));
}

function parsePageDate(html: string): string | null {
  const header = html.match(/<h4[^>]*>([\s\S]*?)<\/h4>/);
  if (!header) return null;

  const text = decodeHtml(header[1].replace(/<[^>]+>/g, ""));
  const match = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return null;

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function jstKickoffToUtcIso(date: string, hour: number, minute: number): string {
  return new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
      hour - 9,
      minute
    )
  ).toISOString();
}

function parseHrefMeta(
  href: string,
  pageDate: string,
  kickoffText?: string
): string {
  if (kickoffText && /^\d{1,2}:\d{2}$/.test(kickoffText)) {
    const [hour, minute] = kickoffText.split(":").map(Number);
    return jstKickoffToUtcIso(pageDate, hour, minute);
  }

  const hrefMatch = href.match(/\/(\d{4})\/(\d{6})\//);
  if (hrefMatch) {
    const month = Number(hrefMatch[2].slice(0, 2));
    const day = Number(hrefMatch[2].slice(2, 4));
    const seq = Number(hrefMatch[2].slice(4, 6));
    const date = `${hrefMatch[1]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const baseHour = 13;
    const minuteOffset = Math.max(0, seq - 6) * 45;
    const totalMinutes = baseHour * 60 + minuteOffset;
    return jstKickoffToUtcIso(
      date,
      Math.floor(totalMinutes / 60),
      totalMinutes % 60
    );
  }

  return jstKickoffToUtcIso(pageDate, 13, 0);
}

function parseScore(point: string): {
  homeGoals: number | null;
  awayGoals: number | null;
} {
  const match = point.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!match) {
    return { homeGoals: null, awayGoals: null };
  }
  return {
    homeGoals: Number(match[1]),
    awayGoals: Number(match[2]),
  };
}

function parsePkRound(pkText: string): string | undefined {
  const match = pkText.match(/\((\d+)\s*PK\s*(\d+)\)/);
  if (!match) return undefined;
  return `${match[2]} PK ${match[1]}`;
}

function parseStatus(
  icon: string | undefined,
  point: string,
  pkText?: string
): { status: string } {
  if (icon?.includes("速報中")) {
    return { status: "LIVE" };
  }
  if (icon?.includes("試合終了")) {
    if (pkText) {
      return { status: "PEN" };
    }
    return { status: "FT" };
  }
  if (/^\d{1,2}:\d{2}$/.test(point)) {
    return { status: "NS" };
  }
  return { status: "NS" };
}

function parseVenue(statusHtml: string): string | undefined {
  const match = statusHtml.match(/<li class="stadium">\[(.*?)\]/);
  if (!match?.[1]) return undefined;
  const venue = decodeHtml(match[1]);
  return VENUE_ALIASES[venue] ?? venue;
}

function stableIdFromHref(href: string): number {
  let hash = 0;
  for (const char of href) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return 9_300_000 + (hash % 1_000_000);
}

function isVegaltaHomeSide(team: string): boolean {
  return (
    team === "Vegalta Sendai" ||
    team === "J2/J3 EAST-A" ||
    team.includes("ベガルタ")
  );
}

export function isVegaltaRelevantTeam(name: string): boolean {
  const normalized = name.toLowerCase();
  return (
    normalized.includes("vegalta") ||
    name.includes("ベガルタ") ||
    name.includes("仙台") ||
    normalized.includes("j2/j3 east-a") ||
    normalized.includes("j2j3east-a")
  );
}

export function isVegaltaRelevantFixture(fixture: SeasonFixture): boolean {
  return (
    isVegaltaRelevantTeam(fixture.homeTeam) ||
    isVegaltaRelevantTeam(fixture.awayTeam)
  );
}

function competitionLabel(raw: string): string {
  if (raw.includes("オールスター")) {
    return "J.League All-Star DAZN Cup";
  }
  return decodeHtml(raw);
}

export function parseJLeagueGamePage(html: string): JLeagueParsedPage | null {
  const pageDate = parsePageDate(html);
  if (!pageDate) return null;

  const matches: SeasonFixture[] = [];
  const blocks = [
    ...html.matchAll(/<li><div class="start">([\s\S]*?)<\/div><\/li>/g),
  ];

  for (const block of blocks) {
    const chunk = block[1];
    const chunkStart = block.index ?? 0;
    const before = html.slice(0, chunkStart);
    const competitionMatch = [...before.matchAll(/<h3>([^<]+)<\/h3>/g)].pop();
    const competition = competitionLabel(competitionMatch?.[1] ?? "J.League");

    const href = chunk.match(/href="([^"]+)"/)?.[1];
    if (!href) continue;

    const row = chunk.match(
      /<tr>[\s\S]*?<td class="clubNameArea">([\s\S]*?)<\/td>[\s\S]*?<td class="status">([\s\S]*?)<\/td>[\s\S]*?<td class="clubNameArea">([\s\S]*?)<\/td>/i
    );
    if (!row) continue;

    const homeTeam = parseClubNameCell(row[1]);
    const awayTeam = parseClubNameCell(row[3]);
    const statusHtml = row[2];
    const point = decodeHtml(
      statusHtml.match(/<li class="point[^"]*">([^<]+)/)?.[1] ?? ""
    );
    const icon = decodeHtml(
      statusHtml.match(/<li class="icon"><span[^>]*>([^<]+)/)?.[1] ?? ""
    );
    const pkText = decodeHtml(
      statusHtml.match(/<li class="pk">([^<]+)/)?.[1] ?? ""
    );
    const venue = parseVenue(statusHtml);
    const { status } = parseStatus(icon, point, pkText || undefined);
    const score =
      status === "NS" && /^\d{1,2}:\d{2}$/.test(point)
        ? { homeGoals: null, awayGoals: null }
        : parseScore(point);
    const kickoffIso = parseHrefMeta(href, pageDate, point);
    const pkRound =
      status === "PEN" && pkText ? parsePkRound(pkText) : undefined;

    const fixture: SeasonFixture = {
      id: stableIdFromHref(href),
      date: kickoffIso,
      status,
      statusLong:
        status === "LIVE"
          ? "Live"
          : status === "NS"
            ? "Not Started"
            : "Match Finished",
      homeTeam,
      awayTeam,
      homeGoals: score.homeGoals,
      awayGoals: score.awayGoals,
      round: pkRound ? `${competition} · ${pkRound}` : competition,
      venue,
      isVegaltaHome: isVegaltaHomeSide(homeTeam),
      infoUrl: `${JLEAGUE_GAME_URL.replace(/\/$/, "")}${href}`,
    };

    if (isVegaltaRelevantFixture(fixture)) {
      matches.push(fixture);
    }
  }

  return { pageDate, matches };
}

export async function fetchJLeagueLiveFixtures(): Promise<SeasonFixture[]> {
  try {
    const response = await fetch(JLEAGUE_GAME_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; VegaltaHispano/1.0; +https://www.vegalta.es)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.8",
      },
      next: { revalidate: JLEAGUE_LIVE_TTL_SECONDS },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const parsed = parseJLeagueGamePage(html);
    return parsed?.matches ?? [];
  } catch {
    return [];
  }
}

export function mergeJLeagueFixtures(
  base: SeasonFixture[],
  jleague: SeasonFixture[]
): SeasonFixture[] {
  const byKey = new Map<string, SeasonFixture>();

  const keyOf = (fixture: SeasonFixture) =>
    `${fixture.date.slice(0, 10)}:${fixture.homeTeam}:${fixture.awayTeam}`;

  const richness = (fixture: SeasonFixture): number => {
    let score = 0;
    if (fixture.homeGoals != null && fixture.awayGoals != null) score += 4;
    if (fixture.status === "LIVE") score += 5;
    if (fixture.status === "PEN" || fixture.status === "FT") score += 3;
    if (fixture.infoUrl?.includes("jleague.jp")) score += 2;
    return score;
  };

  for (const fixture of base) {
    byKey.set(keyOf(fixture), fixture);
  }

  for (const fixture of jleague) {
    const key = keyOf(fixture);
    const existing = byKey.get(key);
    if (!existing || richness(fixture) >= richness(existing)) {
      byKey.set(key, fixture);
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function isFinishedJLeagueFixture(fixture: SeasonFixture): boolean {
  return ["FT", "PEN", "AET"].includes(fixture.status);
}
