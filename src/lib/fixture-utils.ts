import type { SeasonFixture } from "@/lib/football-api";
import type { Dictionary } from "@/i18n/types";

export const FINISHED_STATUSES = new Set([
  "FT",
  "AET",
  "PEN",
  "AWD",
  "WO",
  "ABD",
]);
export const LIVE_STATUSES = new Set([
  "1H",
  "2H",
  "HT",
  "ET",
  "BT",
  "P",
  "LIVE",
  "INT",
]);

export function isFinishedStatus(status: string): boolean {
  return FINISHED_STATUSES.has(status);
}

export function isLiveStatus(status: string): boolean {
  return LIVE_STATUSES.has(status);
}

export function isUpcomingFixture(fixture: SeasonFixture): boolean {
  if (isFinishedStatus(fixture.status)) return false;
  return new Date(fixture.date).getTime() > Date.now();
}

export function formatFixtureDate(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleDateString(dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatFixtureTime(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUpdatedAt(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleString(dateLocale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function getStatusLabel(status: string, dict: Dictionary): string {
  if (isFinishedStatus(status)) return dict.calendar.statusFinished;
  if (isLiveStatus(status)) return dict.calendar.statusLive;
  if (status === "PST") return dict.calendar.statusPostponed;
  return dict.calendar.statusUpcoming;
}

export function getScore(fixture: SeasonFixture): string {
  if (fixture.homeGoals == null || fixture.awayGoals == null) {
    return "—";
  }
  return `${fixture.homeGoals} - ${fixture.awayGoals}`;
}

export function toDateKey(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function groupFixturesByDate(
  fixtures: SeasonFixture[]
): Map<string, SeasonFixture[]> {
  const groups = new Map<string, SeasonFixture[]>();

  for (const fixture of fixtures) {
    const key = toDateKey(fixture.date);
    const bucket = groups.get(key) ?? [];
    bucket.push(fixture);
    groups.set(key, bucket);
  }

  for (const bucket of groups.values()) {
    bucket.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  return groups;
}

export function groupByMonth(
  fixtures: SeasonFixture[],
  locale: string
): Array<{ key: string; label: string; fixtures: SeasonFixture[] }> {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  const groups = new Map<string, SeasonFixture[]>();

  for (const fixture of fixtures) {
    const date = new Date(fixture.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(fixture);
    groups.set(key, bucket);
  }

  return Array.from(groups.entries()).map(([key, monthFixtures]) => {
    const [year, month] = key.split("-").map(Number);
    const label = new Date(year, month, 1).toLocaleDateString(dateLocale, {
      month: "long",
      year: "numeric",
    });

    return { key, label, fixtures: monthFixtures };
  });
}

export type MonthGridCell = {
  date: Date;
  key: string;
  inMonth: boolean;
};

export function buildMonthGrid(year: number, month: number): MonthGridCell[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);
  const cells: MonthGridCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );
    cells.push({
      date,
      key: toDateKey(date),
      inMonth: date.getMonth() === month,
    });
  }

  return cells;
}

export function getDefaultMonth(fixtures: SeasonFixture[]): {
  year: number;
  month: number;
} {
  const now = new Date();
  const upcoming = fixtures
    .filter(isUpcomingFixture)
    .sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )[0];

  if (upcoming) {
    const date = new Date(upcoming.date);
    return { year: date.getFullYear(), month: date.getMonth() };
  }

  const latest = fixtures.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  if (latest) {
    const date = new Date(latest.date);
    return { year: date.getFullYear(), month: date.getMonth() };
  }

  return { year: now.getFullYear(), month: now.getMonth() };
}
