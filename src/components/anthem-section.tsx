"use client";

import { FaYoutube } from "react-icons/fa";
import { SectionHeading } from "@/components/section-heading";
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
      className="flex flex-col items-center w-full px-0 sm:px-2 pt-2 mt-16 scroll-mt-[var(--header-scroll-offset)]"
    >
      <SectionHeading
        title={dict.anthem.title}
        subtitle={dict.anthem.subtitle}
        className="mb-8"
      />

      <div className="w-full max-w-3xl mx-auto">
        <p className="text-center text-vegalta-blue/70 text-sm sm:text-base leading-relaxed mb-6 px-2">
          {dict.anthem.description}
        </p>

        <div className="bg-white border border-vegalta-royal-blue/10 shadow-sm overflow-hidden">
          <div className="aspect-video w-full bg-vegalta-royal-blue/5">
            <iframe
              src={HIMNO_YOUTUBE_EMBED_URL}
              title={dict.anthem.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-vegalta-royal-blue/10">
            <p className="text-xs text-vegalta-blue/50 text-center sm:text-left leading-relaxed">
              {dict.anthem.fanmadeNote}
            </p>
            <a
              href={HIMNO_YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 min-h-11 px-5 py-2.5 bg-vegalta-red text-white hover:bg-vegalta-red-dark text-xs vegalta-section-title font-bold tracking-wide transition-colors"
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
