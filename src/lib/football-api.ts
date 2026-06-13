import { Redis } from "@upstash/redis";
import { unstable_cache } from "next/cache";
import {
  VEGALTA_EMPEROR_CUP_SCHEDULE_URL,
  VEGALTA_JLEAGUE_TICKETS_URL,
} from "@/lib/site-links";
import { mergeOfficialFixtures } from "@/lib/official-fixtures";

const API_BASE = "https://v3.football.api-sports.io";
const THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const CACHE_KEY = "football:vegalta:season:v3";
const CACHE_TTL_SECONDS = 86_400;
const EMPTY_CACHE_TTL_SECONDS = 300;
const DAILY_REQUEST_KEY_PREFIX = "football:api:requests:";
const DAILY_REQUEST_LIMIT = 50;

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD"]);
const VEGALTA_THESPORTSDB_TEAM_ID = "137718";
const J2_THESPORTSDB_LEAGUE_ID = "4824";

export type SeasonFixture = {
  id: number;
  date: string;
  status: string;
  statusLong: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  round?: string;
  venue?: string;
  isVegaltaHome: boolean;
  infoUrl?: string;
};

export type SeasonFixturesData = {
  season: string;
  requestedSeason: string;
  fixtures: SeasonFixture[];
  source: "api" | "fallback";
  provider: "api-football" | "thesportsdb" | "none";
  updatedAt: string;
  /** True when API returned an older season than configured (free plan limit). */
  seasonLimited?: boolean;
  officialScheduleUrl?: string;
  ticketsUrl?: string;
};

export type LastMatch = {
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  status: string;
  round?: string;
  date: string;
  isVegaltaHome: boolean;
};

export type NextMatch = {
  opponent: string;
  date: string;
  venue?: string;
  isVegaltaHome: boolean;
};

export type VegaltaMatches = {
  last: LastMatch | null;
  next: NextMatch | null;
  source: "api" | "fallback";
  updatedAt: string;
};

type ApiFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
    venue?: { name?: string | null; city?: string | null };
  };
  league: { round?: string | null };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    penalty?: { home: number | null; away: number | null };
  };
};

type ApiResponse = {
  response: ApiFixture[];
  errors?: Record<string, string>;
  paging?: { current: number; total: number };
};

type TheSportsDbEvent = {
  idEvent: string;
  strEvent: string;
  strTimestamp?: string;
  dateEvent: string;
  strTime?: string;
  strHomeTeam: string;
  strAwayTeam: string;
  idHomeTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  intRound?: string;
  strVenue?: string;
  strStatus?: string;
};

let memoryCache: { value: SeasonFixturesData; expiresAt: number } | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getTeamId(): number {
  const configured = Number(process.env.API_FOOTBALL_TEAM_ID);
  return Number.isFinite(configured) && configured > 0 ? configured : 289;
}

function getRequestedSeason(): string {
  return (
    process.env.API_FOOTBALL_SEASON?.trim() || String(new Date().getFullYear())
  );
}

export function getSeasonsToTry(requestedSeason = getRequestedSeason()): string[] {
  const year = new Date().getFullYear();
  const candidates = [
    requestedSeason,
    String(year),
    String(year - 1),
    "2024",
    "2023",
    "2022",
  ];

  return [...new Set(candidates.filter(Boolean))];
}

function getApiKey(): string | null {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  return key || null;
}

function todayRequestKey(): string {
  return `${DAILY_REQUEST_KEY_PREFIX}${new Date().toISOString().slice(0, 10)}`;
}

async function canMakeApiRequest(redis: Redis | null): Promise<boolean> {
  if (!redis) return true;

  const count = Number(await redis.get<number>(todayRequestKey()));
  return !Number.isFinite(count) || count < DAILY_REQUEST_LIMIT;
}

async function trackApiRequest(redis: Redis | null): Promise<void> {
  if (!redis) return;

  const key = todayRequestKey();
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 86_400 * 2);
  }
}

function isFinished(status: string): boolean {
  return FINISHED_STATUSES.has(status);
}

function isPlanSeasonError(errors: Record<string, string> | undefined): boolean {
  if (!errors) return false;
  const message = Object.values(errors).join(" ").toLowerCase();
  return message.includes("season") || message.includes("free plans");
}

function mapApiFixture(fixture: ApiFixture, teamId: number): SeasonFixture {
  const isVegaltaHome = fixture.teams.home.id === teamId;
  const penalty = fixture.score.penalty;
  let round = fixture.league.round ?? undefined;

  if (
    fixture.fixture.status.short === "PEN" &&
    penalty?.home != null &&
    penalty?.away != null
  ) {
    round = `${penalty.home} PK ${penalty.away}`;
  }

  const venue = [fixture.fixture.venue?.name, fixture.fixture.venue?.city]
    .filter(Boolean)
    .join(", ");

  return {
    id: fixture.fixture.id,
    date: fixture.fixture.date,
    status: fixture.fixture.status.short,
    statusLong: fixture.fixture.status.long,
    homeTeam: fixture.teams.home.name,
    awayTeam: fixture.teams.away.name,
    homeGoals: fixture.goals.home,
    awayGoals: fixture.goals.away,
    round,
    venue: venue || undefined,
    isVegaltaHome,
  };
}

function mapTheSportsDbEvent(event: TheSportsDbEvent): SeasonFixture {
  const isVegaltaHome = event.idHomeTeam === VEGALTA_THESPORTSDB_TEAM_ID;
  const timestamp =
    event.strTimestamp ||
    `${event.dateEvent}T${event.strTime ?? "00:00:00"}`;

  const homeGoals =
    event.intHomeScore != null && event.intHomeScore !== ""
      ? Number(event.intHomeScore)
      : null;
  const awayGoals =
    event.intAwayScore != null && event.intAwayScore !== ""
      ? Number(event.intAwayScore)
      : null;

  return {
    id: Number(event.idEvent),
    date: timestamp,
    status: event.strStatus?.trim() || "NS",
    statusLong: event.strStatus?.trim() || "Not Started",
    homeTeam: event.strHomeTeam,
    awayTeam: event.strAwayTeam,
    homeGoals: Number.isFinite(homeGoals) ? homeGoals : null,
    awayGoals: Number.isFinite(awayGoals) ? awayGoals : null,
    round: event.intRound ? `J${event.intRound}` : undefined,
    venue: event.strVenue?.trim() || undefined,
    isVegaltaHome,
  };
}

function dedupeFixtures(fixtures: SeasonFixture[]): SeasonFixture[] {
  const byKey = new Map<string, SeasonFixture>();

  for (const fixture of fixtures) {
    const key = `${fixture.date.slice(0, 10)}:${fixture.homeTeam}:${fixture.awayTeam}`;
    byKey.set(key, fixture);
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

async function fetchFixturesForSeasonFromApi(
  season: string,
  apiKey: string,
  redis: Redis | null
): Promise<{ fixtures: SeasonFixture[]; planLimited: boolean }> {
  const teamId = getTeamId();
  const allFixtures: ApiFixture[] = [];
  let page = 1;
  let totalPages = 1;
  let planLimited = false;

  while (page <= totalPages) {
    const params = new URLSearchParams({
      team: String(teamId),
      season,
      page: String(page),
    });

    const leagueId = process.env.API_FOOTBALL_LEAGUE_ID?.trim();
    if (leagueId) {
      params.set("league", leagueId);
    }

    const response = await fetch(`${API_BASE}/fixtures?${params}`, {
      headers: { "x-apisports-key": apiKey },
      next: { revalidate: CACHE_TTL_SECONDS },
    });

    await trackApiRequest(redis);

    if (!response.ok) {
      throw new Error(`API-Football responded with ${response.status}`);
    }

    const json = (await response.json()) as ApiResponse;
    if (json.errors && Object.keys(json.errors).length > 0) {
      if (isPlanSeasonError(json.errors)) {
        planLimited = true;
        return { fixtures: [], planLimited };
      }
      throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
    }

    allFixtures.push(...json.response);
    totalPages = json.paging?.total ?? 1;
    page += 1;
  }

  return {
    fixtures: allFixtures
      .map((fixture) => mapApiFixture(fixture, teamId))
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    planLimited,
  };
}

async function fetchSeasonFixturesFromApiFootball(
  requestedSeason: string
): Promise<{
  fixtures: SeasonFixture[];
  resolvedSeason: string;
  seasonLimited: boolean;
} | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const redis = getRedis();
  if (!(await canMakeApiRequest(redis))) {
    return null;
  }

  let seasonLimited = false;

  for (const season of getSeasonsToTry(requestedSeason)) {
    const result = await fetchFixturesForSeasonFromApi(season, apiKey, redis);
    if (result.planLimited) {
      seasonLimited = true;
      continue;
    }
    if (result.fixtures.length > 0) {
      return {
        fixtures: result.fixtures,
        resolvedSeason: season,
        seasonLimited: season !== requestedSeason || seasonLimited,
      };
    }
  }

  if (seasonLimited) {
    return {
      fixtures: [],
      resolvedSeason: requestedSeason,
      seasonLimited: true,
    };
  }

  return null;
}

async function fetchVegaltaFixturesFromTheSportsDb(
  season: string
): Promise<SeasonFixture[]> {
  const urls = [
    `${THESPORTSDB_BASE}/eventsseason.php?id=${J2_THESPORTSDB_LEAGUE_ID}&s=${season}`,
    `${THESPORTSDB_BASE}/eventslast.php?id=${VEGALTA_THESPORTSDB_TEAM_ID}`,
    `${THESPORTSDB_BASE}/searchevents.php?e=Vegalta_Sendai`,
  ];

  const fixtures: SeasonFixture[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        next: { revalidate: CACHE_TTL_SECONDS },
      });
      if (!response.ok) continue;

      const json = (await response.json()) as {
        events?: TheSportsDbEvent[] | null;
        event?: TheSportsDbEvent[] | null;
        results?: TheSportsDbEvent[] | null;
      };

      const events = [
        ...(json.events ?? []),
        ...(json.event ?? []),
        ...(json.results ?? []),
      ];

      for (const event of events) {
        if (
          !event.strHomeTeam?.includes("Vegalta") &&
          !event.strAwayTeam?.includes("Vegalta")
        ) {
          continue;
        }
        fixtures.push(mapTheSportsDbEvent(event));
      }
    } catch {
      // Best-effort secondary provider.
    }
  }

  return dedupeFixtures(fixtures);
}

function buildFallbackSeasonData(requestedSeason: string): SeasonFixturesData {
  return withOfficialLinks({
    season: requestedSeason,
    requestedSeason,
    fixtures: [],
    source: "fallback",
    provider: "none",
    updatedAt: new Date().toISOString(),
    seasonLimited: true,
  });
}

function withOfficialLinks(
  data: Omit<SeasonFixturesData, "officialScheduleUrl" | "ticketsUrl"> & {
    fixtures: SeasonFixture[];
  }
): SeasonFixturesData {
  return {
    ...data,
    fixtures: mergeOfficialFixtures(data.fixtures),
    officialScheduleUrl: VEGALTA_EMPEROR_CUP_SCHEDULE_URL,
    ticketsUrl: VEGALTA_JLEAGUE_TICKETS_URL,
  };
}

async function fetchSeasonFixturesData(): Promise<SeasonFixturesData> {
  const requestedSeason = getRequestedSeason();

  try {
    const apiResult = await fetchSeasonFixturesFromApiFootball(requestedSeason);
    if (apiResult && apiResult.fixtures.length > 0) {
      let fixtures = apiResult.fixtures;
      let provider: SeasonFixturesData["provider"] = "api-football";

      const hasUpcoming = fixtures.some(
        (fixture) => !isFinished(fixture.status)
      );
      const needsCurrentSeasonData =
        apiResult.seasonLimited ||
        apiResult.resolvedSeason !== requestedSeason ||
        !hasUpcoming;

      if (needsCurrentSeasonData) {
        const supplemental = await fetchVegaltaFixturesFromTheSportsDb(
          requestedSeason
        );
        if (supplemental.length > 0) {
          fixtures = dedupeFixtures([...fixtures, ...supplemental]);
          provider = "thesportsdb";
        }
      }

      return withOfficialLinks({
        season: apiResult.resolvedSeason,
        requestedSeason,
        fixtures,
        source: "api",
        provider,
        updatedAt: new Date().toISOString(),
        seasonLimited: apiResult.seasonLimited,
      });
    }

    const supplemental = await fetchVegaltaFixturesFromTheSportsDb(requestedSeason);
    if (supplemental.length > 0) {
      return withOfficialLinks({
        season: requestedSeason,
        requestedSeason,
        fixtures: supplemental,
        source: "api",
        provider: "thesportsdb",
        updatedAt: new Date().toISOString(),
        seasonLimited: true,
      });
    }

    if (apiResult?.seasonLimited) {
      return buildFallbackSeasonData(requestedSeason);
    }

    return buildFallbackSeasonData(requestedSeason);
  } catch {
    return buildFallbackSeasonData(requestedSeason);
  }
}

async function readCachedSeasonData(): Promise<SeasonFixturesData | null> {
  const redis = getRedis();
  if (redis) {
    return redis.get<SeasonFixturesData>(CACHE_KEY);
  }

  if (memoryCache && memoryCache.expiresAt > Date.now()) {
    return memoryCache.value;
  }

  return null;
}

async function writeCachedSeasonData(data: SeasonFixturesData): Promise<void> {
  const ttl =
    data.fixtures.length === 0 ? EMPTY_CACHE_TTL_SECONDS : CACHE_TTL_SECONDS;
  const redis = getRedis();

  if (redis) {
    await redis.set(CACHE_KEY, data, { ex: ttl });
    return;
  }

  memoryCache = {
    value: data,
    expiresAt: Date.now() + ttl * 1000,
  };
}

const getCachedSeasonData = unstable_cache(
  fetchSeasonFixturesData,
  ["vegalta-football-season-v3"],
  { revalidate: CACHE_TTL_SECONDS }
);

export async function getSeasonFixtures(): Promise<SeasonFixturesData> {
  const cached = await readCachedSeasonData();
  if (cached) return cached;

  const fresh = await getCachedSeasonData();
  await writeCachedSeasonData(fresh);
  return fresh;
}

function mapToLastMatch(fixture: SeasonFixture): LastMatch {
  return {
    homeTeam: fixture.homeTeam.toUpperCase(),
    awayTeam: fixture.awayTeam.toUpperCase(),
    homeGoals: fixture.homeGoals,
    awayGoals: fixture.awayGoals,
    status: fixture.status,
    round: fixture.round,
    date: fixture.date,
    isVegaltaHome: fixture.isVegaltaHome,
  };
}

function mapToNextMatch(fixture: SeasonFixture): NextMatch {
  const opponent = fixture.isVegaltaHome
    ? fixture.awayTeam
    : fixture.homeTeam;

  return {
    opponent,
    date: fixture.date,
    venue: fixture.venue,
    isVegaltaHome: fixture.isVegaltaHome,
  };
}

function isUpcoming(fixture: SeasonFixture): boolean {
  if (isFinished(fixture.status)) return false;
  return new Date(fixture.date).getTime() > Date.now();
}

export function deriveMatchesFromSeason(
  data: SeasonFixturesData
): VegaltaMatches {
  if (data.source === "fallback" || data.fixtures.length === 0) {
    return {
      last: null,
      next: null,
      source: "fallback",
      updatedAt: data.updatedAt,
    };
  }

  const last = data.fixtures
    .filter((fixture) => isFinished(fixture.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const next = data.fixtures
    .filter((fixture) => isUpcoming(fixture))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return {
    last: last ? mapToLastMatch(last) : null,
    next: next ? mapToNextMatch(next) : null,
    source: data.source,
    updatedAt: data.updatedAt,
  };
}

export async function getVegaltaMatches(): Promise<VegaltaMatches> {
  const seasonData = await getSeasonFixtures();
  return deriveMatchesFromSeason(seasonData);
}
