import { FaApple, FaGoogle } from "react-icons/fa";
import { SiSamsung } from "react-icons/si";

type WalletButtonsProps = {
  appleUrl?: string | null;
  googleUrl?: string | null;
  samsungUrl?: string | null;
  googleSaveUrl?: string | null;
  appleLabel: string;
  googleLabel: string;
  samsungLabel: string;
  androidLabel: string;
  appleAvailable?: boolean;
  googleAvailable?: boolean;
  samsungAvailable?: boolean;
  inDevelopment?: boolean;
  developmentTitle?: string;
  developmentNote?: string;
  comingSoonLabel?: string;
  appleUnavailableNote?: string;
};

const btnBase =
  "inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-sm px-4 py-3 text-center text-[0.7rem] leading-snug tracking-wide transition-colors sm:min-h-11 sm:text-xs sm:tracking-wider";

const disabledBtnBase =
  "flex w-full min-w-0 min-h-[4.5rem] cursor-not-allowed flex-col items-center justify-center gap-1 rounded-sm border-2 border-dashed border-vegalta-royal-blue/25 bg-vegalta-royal-blue/5 px-3 py-3 text-center text-[0.7rem] leading-snug tracking-wide text-vegalta-blue/50 sm:min-h-20 sm:text-xs sm:tracking-wider";

export function WalletButtons({
  appleUrl,
  googleUrl,
  samsungUrl,
  googleSaveUrl,
  appleLabel,
  googleLabel,
  samsungLabel,
  androidLabel,
  appleAvailable = false,
  googleAvailable = false,
  samsungAvailable = false,
  inDevelopment = false,
  developmentTitle,
  developmentNote,
  comingSoonLabel,
  appleUnavailableNote,
}: WalletButtonsProps) {
  const googleHref = googleSaveUrl ?? googleUrl;
  const anyReady = appleAvailable || googleAvailable || samsungAvailable;

  if (inDevelopment) {
    return (
      <div className="w-full min-w-0 space-y-3 rounded-xl border border-vegalta-royal-blue/15 bg-vegalta-royal-blue/5 px-4 py-4">
        {developmentTitle && (
          <p className="text-center text-sm font-semibold text-vegalta-royal-blue">
            {developmentTitle}
          </p>
        )}
        {developmentNote && (
          <p className="text-center text-xs leading-relaxed text-vegalta-blue/70">
            {developmentNote}
          </p>
        )}
        <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          <span className={disabledBtnBase}>
            <FaApple className="shrink-0 text-lg opacity-60" aria-hidden />
            <span className="max-w-full break-words">{appleLabel}</span>
            {comingSoonLabel && (
              <span className="text-[0.65rem] uppercase opacity-80">
                ({comingSoonLabel})
              </span>
            )}
          </span>
          <span className={disabledBtnBase}>
            <FaGoogle className="shrink-0 text-lg opacity-60" aria-hidden />
            <span className="max-w-full break-words">{googleLabel}</span>
            {comingSoonLabel && (
              <span className="text-[0.65rem] uppercase opacity-80">
                ({comingSoonLabel})
              </span>
            )}
          </span>
          <span className={`${disabledBtnBase} sm:col-span-2 xl:col-span-1`}>
            <SiSamsung className="shrink-0 text-lg opacity-60" aria-hidden />
            <span className="max-w-full break-words">{samsungLabel}</span>
            {comingSoonLabel && (
              <span className="text-[0.65rem] uppercase opacity-80">
                ({comingSoonLabel})
              </span>
            )}
          </span>
        </div>
      </div>
    );
  }

  if (!anyReady) {
    return appleUnavailableNote ? (
      <p className="w-full max-w-md rounded-sm border border-vegalta-royal-blue/15 bg-vegalta-royal-blue/5 px-4 py-3 text-center text-xs text-vegalta-blue/70">
        {appleUnavailableNote}
      </p>
    ) : null;
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {appleAvailable && appleUrl ? (
        <a
          href={appleUrl}
          className={`${btnBase} bg-vegalta-royal-blue text-white hover:bg-vegalta-blue-light vegalta-section-title`}
        >
          <FaApple className="shrink-0 text-lg" aria-hidden />
          <span>{appleLabel}</span>
        </a>
      ) : appleUnavailableNote ? (
        <p className="col-span-full rounded-sm border border-vegalta-royal-blue/15 bg-vegalta-royal-blue/5 px-4 py-3 text-center text-xs text-vegalta-blue/70">
          {appleUnavailableNote}
        </p>
      ) : null}

      {googleAvailable && googleHref ? (
        <a
          href={googleHref}
          target={googleSaveUrl ? "_blank" : undefined}
          rel={googleSaveUrl ? "noopener noreferrer" : undefined}
          className={`${btnBase} border-2 border-vegalta-royal-blue bg-white text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 vegalta-section-title`}
        >
          <FaGoogle className="shrink-0 text-lg" aria-hidden />
          <span>{googleSaveUrl ? googleLabel : androidLabel}</span>
        </a>
      ) : null}

      {samsungAvailable && samsungUrl ? (
        <a
          href={samsungUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} border-2 border-vegalta-royal-blue bg-white text-vegalta-royal-blue hover:bg-vegalta-royal-blue/5 vegalta-section-title sm:col-span-2 xl:col-span-1`}
        >
          <SiSamsung className="shrink-0 text-lg" aria-hidden />
          <span>{samsungLabel}</span>
        </a>
      ) : null}
    </div>
  );
}
