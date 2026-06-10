"use client";

import { useEffect, useRef, useState } from "react";
import { MembershipCard } from "@/components/membership-card";
import { Button } from "@/components/ui/button";
import { downloadBlob, exportCardSvgToPng } from "@/lib/export-card-image";
import { Download, Share2 } from "lucide-react";

type CarnetSharePanelProps = {
  displayId: string;
  firstName: string;
  lastName: string;
  officialCardLabel: string;
  shareTitle: string;
  shareSubtitle: string;
  shareHint: string;
  sharePrivacyWarning: string;
  downloadLabel: string;
  shareLabel: string;
  exportingLabel: string;
  shareError: string;
  shareUnsupported: string;
};

export function CarnetSharePanel({
  displayId,
  firstName,
  lastName,
  officialCardLabel,
  shareTitle,
  shareSubtitle,
  shareHint,
  sharePrivacyWarning,
  downloadLabel,
  shareLabel,
  exportingLabel,
  shareError,
  shareUnsupported,
}: CarnetSharePanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  async function createPngBlob(): Promise<Blob> {
    if (!cardRef.current) {
      throw new Error("Card container not ready");
    }

    return exportCardSvgToPng(cardRef.current);
  }

  function fileName(): string {
    return `vegalta-carnet-${displayId.toLowerCase()}.png`;
  }

  async function onDownload() {
    setMessage(null);
    setBusy(true);

    try {
      const blob = await createPngBlob();
      downloadBlob(blob, fileName());
    } catch {
      setMessage(shareError);
    } finally {
      setBusy(false);
    }
  }

  async function onShare() {
    setMessage(null);
    setBusy(true);

    try {
      const blob = await createPngBlob();
      const file = new File([blob], fileName(), { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareSubtitle,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareSubtitle,
        });
        return;
      }

      setMessage(shareUnsupported);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setMessage(shareError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="w-full space-y-1 text-center">
        <h2 className="font-display text-lg font-bold text-vegalta-royal-blue sm:text-xl">
          {shareTitle}
        </h2>
        <p className="text-sm text-vegalta-blue/70">{shareSubtitle}</p>
      </div>

      <div
        ref={cardRef}
        className="w-full rounded-2xl bg-white p-4 shadow-lg ring-1 ring-vegalta-royal-blue/10 sm:p-6"
        aria-label={shareTitle}
      >
        <MembershipCard
          displayId={displayId}
          firstName={firstName}
          lastName={lastName}
          officialCardLabel={officialCardLabel}
          className="mx-auto"
        />
      </div>

      <p className="max-w-md text-center text-xs leading-relaxed text-vegalta-blue/60">
        {shareHint}
      </p>

      <div
        role="note"
        className="w-full max-w-md rounded-lg border border-amber-300/80 bg-amber-50 px-4 py-3 text-center text-xs leading-relaxed text-amber-950"
      >
        {sharePrivacyWarning}
      </div>

      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:flex-1"
          onClick={onDownload}
          disabled={busy}
        >
          <Download className="h-4 w-4" aria-hidden />
          {busy ? exportingLabel : downloadLabel}
        </Button>

        {canNativeShare && (
          <Button
            type="button"
            variant="outline"
            className="w-full sm:flex-1"
            onClick={onShare}
            disabled={busy}
          >
            <Share2 className="h-4 w-4" aria-hidden />
            {shareLabel}
          </Button>
        )}
      </div>

      {message && (
        <p className="text-center text-xs text-vegalta-blue/70">{message}</p>
      )}
    </section>
  );
}
