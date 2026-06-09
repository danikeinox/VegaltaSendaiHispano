"use client";

import { cn } from "@/lib/utils";

/** Patrón fijo que imita un QR sin codificar datos válidos. */
const MODULES = [
  "111010101011101010101",
  "101110001010100011101",
  "111010101011101010101",
  "000101110100010111000",
  "110100101101010100110",
  "001011000110100101001",
  "101100110010011011100",
  "010101011101010101010",
  "111000101010101000111",
  "101011100010111010100",
  "000110101011101011000",
  "110010101100101010011",
  "001101010010101101100",
  "101010111000101010101",
  "000111010101010111000",
  "110101001101010010110",
  "001010110010101101001",
  "101101010011010101100",
  "010010101110101010010",
  "111010101011101010101",
  "101110001010100011101",
] as const;

type FakeQrCodeProps = {
  className?: string;
  label?: string;
};

function isInFinderZone(x: number, y: number): boolean {
  return (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
}

function FinderPattern({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width="7" height="7" fill="#002254" />
      <rect x="1" y="1" width="5" height="5" fill="#ffffff" />
      <rect x="2" y="2" width="3" height="3" fill="#002254" />
    </g>
  );
}

export function FakeQrCode({ className, label }: FakeQrCodeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-white p-1.5",
        className
      )}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 21 21"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="21" height="21" fill="#ffffff" />
        {MODULES.map((row, y) =>
          row.split("").map((cell, x) => {
            if (cell !== "1" || isInFinderZone(x, y)) return null;
            return (
              <rect
                key={`${y}-${x}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="#002254"
                opacity={0.82}
              />
            );
          })
        )}
        <FinderPattern x={0} y={0} />
        <FinderPattern x={14} y={0} />
        <FinderPattern x={0} y={14} />
      </svg>
    </div>
  );
}
