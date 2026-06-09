import { Redis } from "@upstash/redis";
import { unstable_cache } from "next/cache";

const API_BASE = "https://v3.football.api-sports.io";
const CACHE_KEY = "football:vegalta:season";
const CACHE_TTL_SECONDS = 86_400;
const DAILY_REQUEST_KEY_PREFIX = "football:api:requests:";
const DAILY_REQUEST_LIMIT = 50;

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD"]);

const FALLBACK_LAST = {
  homeTeam: "VEGALTA SENDAI",
  awayTeam: "KATORE TOYAMA",
  homeGoals: 1,
  awayGoals: 1,
  status: "FT",
  round: "4 PK 2",
  date: new Date().toISOString(),
  isVegaltaHome: true,
};

const FALLBACK_NEXT = {
  opponent: "Yokohama FC",
  date: new Date(Date.now() + 7 * 86_400_000).toISOString(),
  venue: "Yurtec Stadium Sendai",
  isVegaltaHome: true,
};

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
};

export type SeasonFixturesData = {
  season: string;
  fixtures: SeasonFixture[];
  source: "api" | "fallback";
  updatedAt: string;
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

function getSeason(): string {
  return process.env.API_FOOTBALL_SEASON?.trim() || String(new Date().getFullYear());
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

async function fetchSeasonFixturesFromApi(): Promise<SeasonFixture[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const redis = getRedis();
  if (!(await canMakeApiRequest(redis))) {
    return [];
  }

  const season = getSeason();
  const teamId = getTeamId();
  const allFixtures: ApiFixture[] = [];
  let page = 1;
  let totalPages = 1;

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
      throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`);
    }

    allFixtures.push(...json.response);
    totalPages = json.paging?.total ?? 1;
    page += 1;
  }

  return allFixtures
    .map((fixture) => mapApiFixture(fixture, teamId))
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

function buildFallbackSeasonData(): SeasonFixturesData {
  return {
    season: getSeason(),
    fixtures: [],
    source: "fallback",
    updatedAt: new Date().toISOString(),
  };
}

async function fetchSeasonFixturesData(): Promise<SeasonFixturesData> {
  try {
    const fixtures = await fetchSeasonFixturesFromApi();

    if (fixtures.length === 0) {
      return buildFallbackSeasonData();
    }

    return {
      season: getSeason(),
      fixtures,
      source: "api",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return buildFallbackSeasonData();
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
  const redis = getRedis();
  if (redis) {
    await redis.set(CACHE_KEY, data, { ex: CACHE_TTL_SECONDS });
    return;
  }

  memoryCache = {
    value: data,
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
  };
}

const getCachedSeasonData = unstable_cache(
  fetchSeasonFixturesData,
  ["vegalta-football-season"],
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

export function deriveMatchesFromSeason(
  data: SeasonFixturesData
): VegaltaMatches {
  if (data.source === "fallback" || data.fixtures.length === 0) {
    return {
      last: FALLBACK_LAST,
      next: FALLBACK_NEXT,
      source: "fallback",
      updatedAt: data.updatedAt,
    };
  }

  const last = data.fixtures
    .filter((fixture) => isFinished(fixture.status))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const next = data.fixtures
    .filter((fixture) => !isFinished(fixture.status))
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
