"use client";

import { useState } from "react";
import type { SeasonFixture, SeasonFixturesData } from "@/lib/football-api";
import { FixturesMonthGrid } from "@/components/fixtures-month-grid";
import { useLocale } from "@/components/locale-provider";
import type { Dictionary } from "@/i18n/types";
import {
  formatFixtureDate,
  formatFixtureTime,
  formatUpdatedAt,
  getScore,
  getStatusLabel,
  groupByMonth,
  isFinishedStatus,
  isLiveStatus,
  isUpcomingFixture,
} from "@/lib/fixture-utils";
import { SOFASCORE_VEGALTA_URL, JLEAGUE_GAME_URL } from "@/lib/site-links";
import { cn } from "@/lib/utils";

type FixturesCalendarProps = {
  data: SeasonFixturesData;
};

type ViewMode = "list" | "calendar";

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

function FixtureCard({
  fixture,
  locale,
  dict,
}: {
  fixture: SeasonFixture;
  locale: string;
  dict: Dictionary;
}) {
  const finished = isFinishedStatus(fixture.status);
  const live = isLiveStatus(fixture.status);

  return (
    <li className="rounded-xl border border-portal-outline-variant bg-white p-4 portal-card-shadow sm:p-5">
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
}

export function FixturesCalendar({ data }: FixturesCalendarProps) {
  const { locale, dict } = useLocale();
  const [view, setView] = useState<ViewMode>("calendar");
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-portal-on-surface-variant">
            {dict.calendar.seasonLabel.replace(
              "{season}",
              data.seasonLimited ? data.requestedSeason : data.season
            )}
          </p>
          <div className="inline-flex rounded-lg border border-portal-outline-variant bg-white p-1">
            <button
              type="button"
              onClick={() => setView("calendar")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                view === "calendar"
                  ? "bg-portal-primary text-white"
                  : "text-portal-primary hover:bg-portal-surface"
              )}
            >
              {dict.calendar.viewCalendar}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                view === "list"
                  ? "bg-portal-primary text-white"
                  : "text-portal-primary hover:bg-portal-surface"
              )}
            >
              {dict.calendar.viewList}
            </button>
          </div>
        </div>

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

      {view === "calendar" ? (
        <FixturesMonthGrid fixtures={data.fixtures} />
      ) : (
        groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-4 font-display text-lg font-bold capitalize text-portal-primary sm:text-xl">
              {group.label}
            </h2>
            <ul className="space-y-3">
              {group.fixtures.map((fixture) => (
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  locale={locale}
                  dict={dict}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <div className="space-y-2">
        <p className="text-center text-xs text-portal-on-surface-variant sm:text-left">
          {updatedNote}
        </p>
        <p className="text-center text-xs text-portal-on-surface-variant sm:text-left">
          {dict.calendar.jleagueLiveNote}
        </p>
        <p className="text-center text-xs sm:text-left">
          <a
            href={JLEAGUE_GAME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-portal-primary underline-offset-2 hover:underline"
          >
            {dict.calendar.jleagueLiveLink}
          </a>
          {" · "}
          <a
            href={SOFASCORE_VEGALTA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-portal-primary underline-offset-2 hover:underline"
          >
            {dict.calendar.sofascoreLink}
          </a>
        </p>
      </div>
    </div>
  );
}
