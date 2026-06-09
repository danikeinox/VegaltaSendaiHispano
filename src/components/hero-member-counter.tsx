import { getCachedMemberCount } from "@/lib/member-count";

type HeroMemberCounterProps = {
  locale: string;
  label: string;
  updatedNote: string;
  unavailable: string;
};

function formatCount(value: number, locale: string): string {
  const numberLocale = locale === "jp" ? "ja-JP" : "es-ES";
  return new Intl.NumberFormat(numberLocale).format(value);
}

export async function HeroMemberCounter({
  locale,
  label,
  updatedNote,
  unavailable,
}: HeroMemberCounterProps) {
  const count = await getCachedMemberCount();
  const displayValue =
    count !== null ? formatCount(count, locale) : unavailable;

  return (
    <p className="mt-4 max-w-md text-xs leading-relaxed text-white/50 sm:mt-5">
      <span className="tabular-nums text-white/65">{displayValue}</span> {label}
      <span aria-hidden="true"> · </span>
      <span className="text-white/40">{updatedNote}</span>
    </p>
  );
}
