import { describe, expect, it } from "vitest";
import { shouldBypassLocaleRedirect } from "@/lib/site-proxy";

describe("shouldBypassLocaleRedirect", () => {
  it("keeps root metadata routes available without a locale prefix", () => {
    expect(shouldBypassLocaleRedirect("/robots.txt")).toBe(true);
    expect(shouldBypassLocaleRedirect("/sitemap.xml")).toBe(true);
    expect(shouldBypassLocaleRedirect("/manifest.webmanifest")).toBe(true);
    expect(shouldBypassLocaleRedirect("/llms.txt")).toBe(true);
  });

  it("does not redirect dotfiles or well-known routes through the locale prefix", () => {
    expect(shouldBypassLocaleRedirect("/.env")).toBe(true);
    expect(shouldBypassLocaleRedirect("/.git/HEAD")).toBe(true);
    expect(shouldBypassLocaleRedirect("/.well-known/security.txt")).toBe(true);
  });

  it("still allows ordinary content pages to receive a locale prefix", () => {
    expect(shouldBypassLocaleRedirect("/sobre")).toBe(false);
    expect(shouldBypassLocaleRedirect("/calendario")).toBe(false);
  });
});
