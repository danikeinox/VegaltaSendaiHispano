"use client";

import { FaYoutube } from "react-icons/fa";
import { useLocale } from "@/components/locale-provider";
import {
  HIMNO_YOUTUBE_EMBED_URL,
  HIMNO_YOUTUBE_URL,
} from "@/lib/constants";

export function AnthemSection() {
  const { dict } = useLocale();

  return (
    <section
      id="himno"
      className="scroll-mt-[var(--header-scroll-offset)] bg-portal-surface py-12 sm:py-16"
    >
      <div className="mx-auto max-w-portal px-4 sm:px-6">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="font-display text-2xl font-bold text-portal-primary sm:text-3xl">
            {dict.anthem.title}
          </h2>
          <p className="mt-2 text-sm text-portal-on-surface-variant sm:text-base">
            {dict.anthem.subtitle}
          </p>
        </div>

        <p className="mx-auto mb-6 max-w-2xl text-center text-sm leading-relaxed text-portal-on-surface-variant sm:text-base">
          {dict.anthem.description}
        </p>

        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-portal-outline-variant bg-white portal-card-shadow">
          <div className="aspect-video w-full bg-portal-primary/5">
            <iframe
              src={HIMNO_YOUTUBE_EMBED_URL}
              title={dict.anthem.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-portal-outline-variant p-5 sm:flex-row sm:p-6">
            <p className="text-center text-xs leading-relaxed text-portal-on-surface-variant sm:text-left">
              {dict.anthem.fanmadeNote}
            </p>
            <a
              href={HIMNO_YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="portal-label inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-vegalta-red px-5 py-2.5 text-xs text-white transition-colors hover:bg-vegalta-red-dark"
            >
              <FaYoutube className="text-lg" aria-hidden />
              {dict.anthem.watchOnYoutube}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
