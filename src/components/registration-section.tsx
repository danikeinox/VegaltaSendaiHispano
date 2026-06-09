"use client";

import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { MembershipPreviewCard } from "@/components/membership-preview-card";
import { RegistrationForm } from "@/components/registration-form";
import { useLocale } from "@/components/locale-provider";

export function RegistrationSection() {
  const { dict } = useLocale();
  const [previewName, setPreviewName] = useState("");

  return (
    <section
      id="registro"
      className="scroll-mt-[var(--header-scroll-offset)] bg-portal-surface-container py-12 sm:py-16"
    >
      <div className="mx-auto w-full max-w-portal px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="font-display text-2xl font-bold text-portal-primary sm:text-3xl">
            {dict.register.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-portal-on-surface-variant sm:text-base">
            {dict.register.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="min-w-0 lg:col-span-7">
            <MembershipPreviewCard fullName={previewName} />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <RegistrationForm
              variant="portal"
              onPreviewNameChange={setPreviewName}
              className="h-full w-full"
            />
          </div>
        </div>

        <p className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-center text-xs italic text-portal-on-surface-variant lg:mx-0 lg:max-w-[calc(58.333%-1rem)] lg:justify-start lg:text-left">
          <FaInfoCircle className="shrink-0" aria-hidden />
          {dict.previewCard.disclaimer}
        </p>
      </div>
    </section>
  );
}
