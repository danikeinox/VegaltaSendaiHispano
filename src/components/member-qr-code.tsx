"use client";

import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

type MemberQrCodeProps = {
  url: string;
  size?: number;
  className?: string;
  label?: string;
};

export function MemberQrCode({
  url,
  size = 80,
  className,
  label,
}: MemberQrCodeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-white p-1.5",
        className
      )}
      role="img"
      aria-label={label}
    >
      <QRCode
        value={url}
        size={size}
        bgColor="#ffffff"
        fgColor="#002254"
        level="M"
      />
    </div>
  );
}
