import { FaApple, FaGoogle } from "react-icons/fa";

type WalletButtonsProps = {
  appleUrl?: string | null;
  googleUrl?: string | null;
  googleSaveUrl?: string | null;
  appleLabel: string;
  googleLabel: string;
  androidLabel: string;
  appleAvailable?: boolean;
  googleAvailable?: boolean;
  appleUnavailableNote?: string;
};

const btnBase =
  "inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-sm px-4 py-3 text-center text-[0.7rem] leading-snug tracking-wide transition-colors sm:min-h-11 sm:text-xs sm:tracking-wider";

export function WalletButtons({
  appleUrl,
  googleUrl,
  googleSaveUrl,
  appleLabel,
  googleLabel,
  androidLabel,
  appleAvailable = true,
  googleAvailable = true,
  appleUnavailableNote,
}: WalletButtonsProps) {
  const googleHref = googleSaveUrl ?? googleUrl;

  if (!appleAvailable && !googleAvailable) {
    return null;
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch">
      {appleAvailable && appleUrl ? (
        <a
          href={appleUrl}
          className={`${btnBase} flex-1 bg-vegalta-royal-blue text-white hover:bg-vegalta-blue-light vegalta-section-title`}
        >
          <FaApple className="shrink-0 text-lg" aria-hidden />
          <span>{appleLabel}</span>
        </a>
      ) : appleUnavailableNote ? (
        <p className="w-full rounded-sm border border-vegalta-royal-blue/15 bg-vegalta-royal-blue/5 px-4 py-3 text-center text-xs text-vegalta-blue/70">
          {appleUnavailableNote}
        </p>
      ) : null}

      {googleAvailable && googleHref ? (
        <a
          href={googleHref}
          target={googleSaveUrl ? "_blank" : undefined}
          rel={googleSaveUrl ? "noopener noreferrer" : undefined}
          className={`${btnBase} flex-1 border-2 border-vegalta-royal-blue bg-white text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 vegalta-section-title`}
        >
          <FaGoogle className="shrink-0 text-lg" aria-hidden />
          <span>{googleSaveUrl ? googleLabel : androidLabel}</span>
        </a>
      ) : null}
    </div>
  );
}
