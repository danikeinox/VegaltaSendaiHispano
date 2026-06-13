"use client";

import type { SeasonFixture, SeasonFixturesData } from "@/lib/football-api";
import { useLocale } from "@/components/locale-provider";
import type { Dictionary } from "@/i18n/types";
import { cn } from "@/lib/utils";

type FixturesCalendarProps = {
  data: SeasonFixturesData;
};

const FINISHED = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD"]);
const LIVE = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"]);

function formatFixtureDate(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleDateString(dateLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatFixtureTime(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatUpdatedAt(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleString(dateLocale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getStatusLabel(status: string, dict: Dictionary): string {
  if (FINISHED.has(status)) return dict.calendar.statusFinished;
  if (LIVE.has(status)) return dict.calendar.statusLive;
  if (status === "PST") return dict.calendar.statusPostponed;
  return dict.calendar.statusUpcoming;
}

function getScore(fixture: SeasonFixture): string {
  if (fixture.homeGoals == null || fixture.awayGoals == null) {
    return "—";
  }
  return `${fixture.homeGoals} - ${fixture.awayGoals}`;
}

function groupByMonth(
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

function OfficialLinks({
  scheduleUrl,
  ticketsUrl,
  scheduleLabel,
  ticketsLabel,
}: {
  scheduleUrl: string;
  ticketsUrl?: string;
  scheduleLabel: string;
  ticketsLabel: string;
}) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-4">
      <a
        href={scheduleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-semibold text-portal-primary underline-offset-2 hover:underline"
      >
        {scheduleLabel}
      </a>
      {ticketsUrl && (
        <a
          href={ticketsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-portal-primary underline-offset-2 hover:underline"
        >
          {ticketsLabel}
        </a>
      )}
    </div>
  );
}

function isUpcomingFixture(fixture: SeasonFixture): boolean {
  if (FINISHED.has(fixture.status)) return false;
  return new Date(fixture.date).getTime() > Date.now();
}

export function FixturesCalendar({ data }: FixturesCalendarProps) {
  const { locale, dict } = useLocale();
  const groups = groupByMonth(data.fixtures, locale);
  const updatedNote = dict.calendar.updatedNote.replace(
    "{updatedAt}",
    formatUpdatedAt(data.updatedAt, locale)
  );
  const hasUpcoming = data.fixtures.some(isUpcomingFixture);
  const showSeasonNote =
    data.seasonLimited && data.season !== data.requestedSeason;
  const seasonLimitedNote = dict.calendar.seasonLimitedNote
    .replace("{season}", data.season)
    .replace("{requestedSeason}", data.requestedSeason);
  const officialUrl = data.officialScheduleUrl;
  const ticketsUrl = data.ticketsUrl;

  if (data.fixtures.length === 0) {
    return (
      <div className="rounded-2xl border border-portal-outline-variant bg-white p-8 text-center portal-card-shadow">
        <p className="text-sm text-portal-on-surface-variant">
          {dict.calendar.noFixtures}
        </p>
        {officialUrl && (
          <OfficialLinks
            scheduleUrl={officialUrl}
            ticketsUrl={ticketsUrl}
            scheduleLabel={dict.calendar.officialScheduleLink}
            ticketsLabel={dict.calendar.ticketsLink}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm text-portal-on-surface-variant">
          {dict.calendar.seasonLabel.replace(
            "{season}",
            data.seasonLimited ? data.requestedSeason : data.season
          )}
        </p>
        {showSeasonNote && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
            <p>{seasonLimitedNote}</p>
          </div>
        )}
        {!hasUpcoming && officialUrl && (
          <div className="rounded-xl border border-portal-outline-variant bg-portal-surface p-4 text-sm leading-relaxed text-portal-on-surface-variant">
            <p>{dict.calendar.scheduleDisclaimer}</p>
            <OfficialLinks
              scheduleUrl={officialUrl}
              ticketsUrl={ticketsUrl}
              scheduleLabel={dict.calendar.officialScheduleLink}
              ticketsLabel={dict.calendar.ticketsLink}
            />
          </div>
        )}
      </div>

      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="mb-4 font-display text-lg font-bold capitalize text-portal-primary sm:text-xl">
            {group.label}
          </h2>
          <ul className="space-y-3">
            {group.fixtures.map((fixture) => {
              const finished = FINISHED.has(fixture.status);
              const live = LIVE.has(fixture.status);

              return (
                <li
                  key={fixture.id}
                  className="rounded-xl border border-portal-outline-variant bg-white p-4 portal-card-shadow sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
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
                        {fixture.round && (
                          <span className="text-[11px] text-portal-on-surface-variant">
                            {fixture.round}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-portal-on-surface-variant">
                        {formatFixtureDate(fixture.date, locale)} ·{" "}
                        {formatFixtureTime(fixture.date, locale)}
                      </p>
                    </div>

                    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:max-w-xl sm:gap-3">
                      <span
                        className={cn(
                          "truncate text-right text-sm font-semibold sm:text-base",
                          fixture.isVegaltaHome
                            ? "text-portal-primary"
                            : "text-portal-on-surface"
                        )}
                      >
                        {fixture.homeTeam}
                      </span>
                      <span className="font-display text-xl font-extrabold text-portal-gold-text sm:text-2xl">
                        {finished || live ? getScore(fixture) : "vs"}
                      </span>
                      <span
                        className={cn(
                          "truncate text-left text-sm font-semibold sm:text-base",
                          !fixture.isVegaltaHome
                            ? "text-portal-primary"
                            : "text-portal-on-surface"
                        )}
                      >
                        {fixture.awayTeam}
                      </span>
                    </div>
                  </div>

                  {fixture.venue && (
                    <p className="mt-3 text-xs text-portal-on-surface-variant">
                      {dict.calendar.venue}: {fixture.venue}
                    </p>
                  )}
                  {fixture.infoUrl && (
                    <p className="mt-2">
                      <a
                        href={fixture.infoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-portal-primary underline-offset-2 hover:underline"
                      >
                        {dict.calendar.matchInfoLink}
                      </a>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-center text-xs text-portal-on-surface-variant sm:text-left">
        {updatedNote}
      </p>
    </div>
  );
}
