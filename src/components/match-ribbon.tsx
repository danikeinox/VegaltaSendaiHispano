"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FaInfoCircle } from "react-icons/fa";
import { useLocale } from "@/components/locale-provider";
import { localizedPath } from "@/i18n/navigation";
import type { VegaltaMatches } from "@/lib/football-api";
import { cn } from "@/lib/utils";

type MatchRibbonProps = {
  matches: VegaltaMatches;
};

function formatMatchDate(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleDateString(dateLocale, {
    month: "short",
    day: "numeric",
  });
}

function formatUpdatedAt(date: string, locale: string): string {
  const dateLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Date(date).toLocaleString(dateLocale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatNextMatchLine(
  match: NonNullable<VegaltaMatches["next"]>,
  locale: string
): string {
  const dateLabel = formatMatchDate(match.date, locale);
  return match.venue ? `${dateLabel} · ${match.venue}` : dateLabel;
}

function MatchBadge({
  children,
  variant = "latest",
}: {
  children: ReactNode;
  variant?: "latest" | "next";
}) {
  return (
    <span
      className={cn(
        "portal-label inline-flex w-fit shrink-0 rounded px-3 py-1 text-[10px]",
        variant === "latest"
          ? "bg-portal-gold-dark text-white"
          : "bg-white/20 text-white"
      )}
    >
      {children}
    </span>
  );
}

function CalendarLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "portal-label inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-white/10 px-4 py-2.5 text-xs transition-colors hover:bg-white/20 sm:w-auto sm:py-2",
        className
      )}
    >
      {label}
    </Link>
  );
}

export function MatchRibbon({ matches }: MatchRibbonProps) {
  const { locale, dict } = useLocale();
  const last = matches.last;
  const next = matches.next;

  const lastScore =
    last && last.homeGoals != null && last.awayGoals != null
      ? `${last.homeGoals} - ${last.awayGoals}`
      : "—";

  const lastMeta = last?.round
    ? `${last.round} · ${dict.match.final}`
    : last?.status ?? dict.match.final;

  const updatedNote = dict.match.updatedNote.replace(
    "{updatedAt}",
    formatUpdatedAt(matches.updatedAt, locale)
  );
  const calendarPath = localizedPath(locale, "/calendario");

  return (
    <section className="relative z-20 shrink-0 bg-portal-primary-container pb-3 pt-4 text-white sm:pb-4 sm:pt-10 md:pt-14">
      <div className="mx-auto w-full max-w-portal px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-6">
          {/* Último partido */}
          <div className="min-w-0 border-b border-white/10 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:gap-5">
              <MatchBadge variant="latest">{dict.match.latestLabel}</MatchBadge>

              {last ? (
                <div className="min-w-0 flex-1 space-y-2 md:space-y-0">
                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1 sm:gap-x-3">
                    <span className="portal-label line-clamp-2 text-right text-[11px] leading-tight sm:text-sm">
                      {last.homeTeam}
                    </span>
                    <span className="font-display whitespace-nowrap px-1 text-xl font-extrabold text-portal-gold-light sm:text-2xl md:text-3xl">
                      {lastScore}
                    </span>
                    <span className="portal-label line-clamp-2 text-left text-[11px] leading-tight sm:text-sm">
                      {last.awayTeam}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-center text-[11px] text-white/60 md:text-left md:text-xs">
                    {lastMeta}
                  </p>
                </div>
              ) : (
                <span className="text-sm text-white/70">
                  {dict.match.unavailable}
                </span>
              )}
            </div>
          </div>

          {/* Próximo partido */}
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:gap-5">
              <MatchBadge variant="next">{dict.match.nextLabel}</MatchBadge>

              <div className="min-w-0 flex-1">
                {next ? (
                  <>
                    <p className="portal-label text-sm leading-snug">
                      {next.round ? (
                        <>
                          <span className="block">{next.round}</span>
                          <span className="mt-0.5 block text-white/90">
                            {dict.match.vs} {next.opponent}
                          </span>
                        </>
                      ) : (
                        <span className="block">
                          {dict.match.vs} {next.opponent}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-white/80 sm:text-[13px]">
                      {formatNextMatchLine(next, locale)}
                    </p>
                  </>
                ) : (
                  <span className="text-sm text-white/70">
                    {dict.match.unavailable}
                  </span>
                )}
              </div>

              <CalendarLink
                href={calendarPath}
                label={dict.match.fullCalendar}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-white/45 md:mt-2 md:justify-start">
          <FaInfoCircle className="shrink-0" aria-hidden />
          <span>{updatedNote}</span>
        </p>
      </div>
    </section>
  );
}
