import { afterEach, describe, expect, it } from "vitest";
import {
  getAllowedSiteOrigins,
  getPrimarySiteOrigin,
  normalizeSiteUrl,
  resolveSiteBaseUrl,
} from "@/lib/site-origin";

describe("normalizeSiteUrl", () => {
  it("elimina /* y barras finales", () => {
    expect(normalizeSiteUrl("https://www.vegalta.es/*")).toBe(
      "https://www.vegalta.es"
    );
    expect(normalizeSiteUrl("https://www.vegalta.es/")).toBe(
      "https://www.vegalta.es"
    );
    expect(normalizeSiteUrl("https://www.vegalta.es**")).toBe(
      "https://www.vegalta.es"
    );
  });
});

describe("site origins with misconfigured env", () => {
  afterEach(() => {
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NODE_ENV;
  });

  it("acepta ALLOWED_ORIGIN con /* para CORS/CSRF", () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOWED_ORIGIN = "https://www.vegalta.es/*";

    expect(getAllowedSiteOrigins()).toEqual([
      "https://www.vegalta.es",
      "https://vegalta.es",
    ]);
    expect(getPrimarySiteOrigin()).toBe("https://www.vegalta.es");
    expect(resolveSiteBaseUrl()).toBe("https://www.vegalta.es");
  });
});
