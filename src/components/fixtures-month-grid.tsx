"use client";

import { useMemo, useState } from "react";
import type { SeasonFixture } from "@/lib/football-api";
import { useLocale } from "@/components/locale-provider";
import {
  buildMonthGrid,
  formatFixtureDate,
  formatFixtureTime,
  getDefaultMonth,
  getScore,
  getStatusLabel,
  groupFixturesByDate,
  isFinishedStatus,
  isLiveStatus,
  toDateKey,
} from "@/lib/fixture-utils";
import { cn } from "@/lib/utils";

type FixturesMonthGridProps = {
  fixtures: SeasonFixture[];
};

function formatMonthLabel(year: number, month: number, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(year, month, 1).toLocaleDateString(dateLocale, {
    month: "long",
    year: "numeric",
  });
}

function weekdayLabels(locale: string): string[] {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  const monday = new Date(2026, 0, 5);
  return Array.from({ length: 7 }, (_, index) =>
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)
      .toLocaleDateString(dateLocale, { weekday: "short" })
      .replace(".", "")
  );
}

export function FixturesMonthGrid({ fixtures }: FixturesMonthGridProps) {
  const { locale, dict } = useLocale();
  const fixturesByDate = useMemo(
    () => groupFixturesByDate(fixtures),
    [fixtures]
  );
  const defaultMonth = useMemo(
    () => getDefaultMonth(fixtures),
    [fixtures]
  );
  const [year, setYear] = useState(defaultMonth.year);
  const [month, setMonth] = useState(defaultMonth.month);
  const [selectedKey, setSelectedKey] = useState<string | null>(() => {
    const upcoming = fixtures.find(
      (fixture) => new Date(fixture.date).getTime() > Date.now()
    );
    return upcoming ? toDateKey(upcoming.date) : null;
  });

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekdays = weekdayLabels(locale);
  const selectedFixtures = selectedKey
    ? (fixturesByDate.get(selectedKey) ?? [])
    : [];

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="rounded-lg border border-portal-outline-variant px-3 py-2 text-xs font-semibold text-portal-primary transition-colors hover:bg-portal-surface"
          aria-label={dict.calendar.prevMonth}
        >
          ←
        </button>
        <h3 className="font-display text-base font-bold capitalize text-portal-primary sm:text-lg">
          {formatMonthLabel(year, month, locale)}
        </h3>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="rounded-lg border border-portal-outline-variant px-3 py-2 text-xs font-semibold text-portal-primary transition-colors hover:bg-portal-surface"
          aria-label={dict.calendar.nextMonth}
        >
          →
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-portal-outline-variant bg-white portal-card-shadow">
        <div className="grid grid-cols-7 border-b border-portal-outline-variant bg-portal-surface text-center">
          {weekdays.map((label) => (
            <div
              key={label}
              className="px-1 py-2 text-[10px] font-bold uppercase tracking-wide text-portal-on-surface-variant sm:text-xs"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const dayFixtures = fixturesByDate.get(cell.key) ?? [];
            const isSelected = selectedKey === cell.key;
            const isToday = cell.key === toDateKey(new Date());

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelectedKey(cell.key)}
                className={cn(
                  "relative min-h-14 border-b border-r border-portal-outline-variant/70 p-1 text-left transition-colors last:border-r-0 sm:min-h-16 sm:p-2",
                  cell.inMonth
                    ? "bg-white hover:bg-portal-surface/60"
                    : "bg-portal-surface/40 text-portal-on-surface-variant/50",
                  isSelected && "ring-2 ring-inset ring-portal-primary/40"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                    isToday && cell.inMonth
                      ? "bg-portal-primary text-white"
                      : "text-portal-on-surface"
                  )}
                >
                  {cell.date.getDate()}
                </span>
                {dayFixtures.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-0.5">
                    {dayFixtures.slice(0, 3).map((fixture) => (
                      <span
                        key={fixture.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isLiveStatus(fixture.status)
                            ? "bg-vegalta-red"
                            : isFinishedStatus(fixture.status)
                              ? "bg-portal-on-surface-variant/50"
                              : "bg-portal-gold"
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-portal-outline-variant bg-white p-4 portal-card-shadow sm:p-5">
        {selectedKey ? (
          <>
            <h4 className="mb-3 text-sm font-bold text-portal-primary">
              {dict.calendar.selectedDayLabel.replace(
                "{date}",
                formatFixtureDate(`${selectedKey}T12:00:00.000Z`, locale)
              )}
            </h4>
            {selectedFixtures.length > 0 ? (
              <ul className="space-y-3">
                {selectedFixtures.map((fixture) => {
                  const finished = isFinishedStatus(fixture.status);
                  const live = isLiveStatus(fixture.status);

                  return (
                    <li
                      key={fixture.id}
                      className="rounded-xl border border-portal-outline-variant/80 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            live
                              ? "bg-vegalta-red/10 text-vegalta-red"
                              : finished
                                ? "bg-portal-surface-container text-portal-on-surface-variant"
                                : "bg-portal-primary/8 text-portal-primary"
                          )}
                        >
                          {getStatusLabel(fixture.status, dict)}
                        </span>
                        <span className="text-xs text-portal-on-surface-variant">
                          {formatFixtureTime(fixture.date, locale)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-portal-on-surface">
                        {fixture.homeTeam}{" "}
                        <span className="font-display text-portal-gold-text">
                          {finished || live ? getScore(fixture) : "vs"}
                        </span>{" "}
                        {fixture.awayTeam}
                      </p>
                      {fixture.round && (
                        <p className="mt-1 text-xs text-portal-on-surface-variant">
                          {fixture.round}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-portal-on-surface-variant">
                {dict.calendar.noMatchesDay}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-portal-on-surface-variant">
            {dict.calendar.pickDayHint}
          </p>
        )}
      </div>
    </div>
  );
}
