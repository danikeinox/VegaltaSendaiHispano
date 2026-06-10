"use client";

import { buildMembershipCardSvg } from "@/lib/membership-card-svg";

type MembershipCardProps = {
  displayId: string;
  firstName: string;
  lastName: string;
  officialCardLabel?: string;
  className?: string;
};

export function MembershipCard({
  displayId,
  firstName,
  lastName,
  officialCardLabel = "CARNET FAN OFICIAL",
  className = "",
}: MembershipCardProps) {
  const svgMarkup = buildMembershipCardSvg({
    displayId,
    firstName,
    lastName,
    officialCardLabel,
    idPrefix: "view",
  });

  return (
    <div
      className={`mx-auto w-full max-w-[min(100%,520px)] px-1 sm:px-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
