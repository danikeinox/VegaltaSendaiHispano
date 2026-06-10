"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

type TurnstileWidgetProps = {
  siteKey: string;
  onToken: (token: string | null) => void;
  className?: string;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "light" | "dark" | "auto";
    }
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({
  siteKey,
  onToken,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.turnstile) return;

    widgetIdRef.current = window.turnstile.render(container, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(null),
      "error-callback": () => onToken(null),
      theme: "auto",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onToken]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onLoad={() => {
          const container = containerRef.current;
          if (!container || !window.turnstile || widgetIdRef.current) return;

          widgetIdRef.current = window.turnstile.render(container, {
            sitekey: siteKey,
            callback: (token) => onToken(token),
            "expired-callback": () => onToken(null),
            "error-callback": () => onToken(null),
            theme: "auto",
          });
        }}
      />
      <div ref={containerRef} className={className} />
    </>
  );
}
