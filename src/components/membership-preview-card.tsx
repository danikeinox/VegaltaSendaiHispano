"use client";

import { ClubLogo } from "@/components/club-logo";
import { FakeQrCode } from "@/components/fake-qr-code";
import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

type MembershipPreviewCardProps = {
  fullName: string;
  className?: string;
};

export function MembershipPreviewCard({
  fullName,
  className,
}: MembershipPreviewCardProps) {
  const { dict } = useLocale();
  const displayName =
    fullName.trim().toUpperCase() || dict.previewCard.placeholderName;

  return (
    <div
      className={cn(
        "portal-card-shadow relative flex w-full min-w-0 max-w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-portal-primary to-portal-primary-container p-5 text-white sm:p-6 lg:min-h-full lg:p-8",
        className
      )}
    >
      {/* Bandera española 1:2:1 — tres franjas en esquina superior izquierda */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[70%] w-[75%] max-w-[18rem]"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[#c60b1e]" />
        <div
          className="absolute inset-0 bg-[#f1bf00]"
          style={{
            clipPath: "polygon(25% 0, 75% 0, 0 75%, 0 25%)",
          }}
        />
      </div>

      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-portal-gold/10 blur-3xl sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-tight sm:text-xl lg:text-2xl">
            {dict.previewCard.memberType.split(" ").map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-portal-gold-light sm:text-xs lg:text-sm">
            {dict.previewCard.pena}
          </p>
        </div>
        <span className="shrink-0 font-display text-lg font-black text-white/20 sm:text-xl lg:text-2xl">
          {dict.previewCard.season}
        </span>
      </div>

      <div className="relative z-10 mt-5 flex flex-col gap-5 sm:mt-6 lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs opacity-60">{dict.previewCard.member}</p>
          <p className="break-words font-display text-base font-bold uppercase leading-tight tracking-wide sm:text-lg lg:text-2xl">
            {displayName}
          </p>
          <div className="mt-3 flex gap-6 text-sm sm:mt-4">
            <div>
              <p className="text-xs opacity-60">{dict.previewCard.id}</p>
              <p className="portal-label text-white">VS-0001</p>
            </div>
            <div>
              <p className="text-xs opacity-60">{dict.previewCard.since}</p>
              <p className="portal-label text-white">JUN 2026</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-4 self-stretch border-t border-white/10 pt-4 lg:flex-col lg:gap-2 lg:self-auto lg:border-t-0 lg:pt-0">
          <ClubLogo className="h-14 w-14 drop-shadow-[0_3px_12px_rgba(0,0,0,0.45)] sm:h-16 sm:w-16 lg:h-20 lg:w-20 xl:h-[5.5rem] xl:w-[5.5rem]" />
          <FakeQrCode
            className="h-[4.5rem] w-[4.5rem] opacity-75 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            label={dict.previewCard.qrPreviewLabel}
          />
        </div>
      </div>
    </div>
  );
}
