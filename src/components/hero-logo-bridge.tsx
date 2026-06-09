import { ClubLogo } from "@/components/club-logo";

export function HeroLogoBridge() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-1/2 z-30 -translate-x-1/2 translate-y-1/2"
      aria-hidden
    >
      <ClubLogo
        size="xl"
        priority
        className="h-20 w-20 drop-shadow-[0_8px_28px_rgba(0,0,0,0.5)] sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-32 lg:w-32"
      />
    </div>
  );
}
