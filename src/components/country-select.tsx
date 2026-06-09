"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaGlobeAmericas, FaSearch, FaTimes } from "react-icons/fa";
import type { Locale } from "@/i18n/config";
import {
  getCountryName,
  getCountryOptions,
  type CountryCode,
} from "@/lib/countries";
import { cn } from "@/lib/utils";

type CountrySelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  noResultsLabel: string;
  className?: string;
  disabled?: boolean;
};

export function CountrySelect({
  id,
  value,
  onChange,
  locale,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  noResultsLabel,
  className,
  disabled = false,
}: CountrySelectProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const options = useMemo(() => getCountryOptions(locale), [locale]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "jp" ? "ja" : "es");
    if (!normalized) return options;

    return options.filter((option) =>
      option.name.toLocaleLowerCase(locale === "jp" ? "ja" : "es").includes(normalized)
    );
  }, [options, query, locale]);

  const selectedName = value ? getCountryName(value, locale) : "";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    const frame = requestAnimationFrame(() => searchRef.current?.focus());

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      cancelAnimationFrame(frame);
    };
  }, [open]);

  function selectCountry(code: CountryCode | "") {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-lg border border-portal-outline-variant bg-white px-4 text-left text-sm transition-colors",
          "hover:border-portal-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal-primary/20",
          open && "border-portal-primary ring-2 ring-portal-primary/20",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <FaGlobeAmericas
          className="shrink-0 text-portal-primary/70"
          aria-hidden
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selectedName
              ? "text-portal-on-surface"
              : "text-portal-on-surface-variant/70"
          )}
        >
          {selectedName || placeholder}
        </span>
        <FaChevronDown
          className={cn(
            "shrink-0 text-portal-on-surface-variant transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-portal-outline-variant bg-white portal-card-shadow">
          <div className="border-b border-portal-outline-variant/70 p-2">
            <div className="relative">
              <FaSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-portal-on-surface-variant/60"
                aria-hidden
              />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-portal-outline-variant bg-portal-surface pl-9 pr-9 text-sm text-portal-on-surface placeholder:text-portal-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-portal-primary/20"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-portal-on-surface-variant hover:bg-portal-surface-container"
                  aria-label={searchPlaceholder}
                >
                  <FaTimes className="text-xs" aria-hidden />
                </button>
              )}
            </div>
          </div>

          <ul
            id={listId}
            role="listbox"
            aria-label={placeholder}
            className="max-h-60 overflow-y-auto py-1"
          >
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                onClick={() => selectCountry("")}
                className={cn(
                  "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                  value === ""
                    ? "bg-portal-primary/8 font-medium text-portal-primary"
                    : "text-portal-on-surface-variant hover:bg-portal-surface-container"
                )}
              >
                {emptyLabel}
              </button>
            </li>

            {filteredOptions.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-portal-on-surface-variant">
                {noResultsLabel}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const showDivider =
                  index === PINNED_DIVIDER_INDEX &&
                  !query &&
                  filteredOptions.length > PINNED_DIVIDER_INDEX + 1;

                return (
                  <li key={option.code} role="presentation">
                    {showDivider && (
                      <div
                        className="mx-4 my-1 border-t border-portal-outline-variant/70"
                        aria-hidden
                      />
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={value === option.code}
                      onClick={() => selectCountry(option.code)}
                      className={cn(
                        "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                        value === option.code
                          ? "bg-portal-gold/20 font-medium text-portal-primary"
                          : "text-portal-on-surface hover:bg-portal-surface-container"
                      )}
                    >
                      {option.name}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const PINNED_DIVIDER_INDEX = 10;
