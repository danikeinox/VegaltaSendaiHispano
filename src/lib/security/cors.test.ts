import { afterEach, describe, expect, it } from "vitest";
import { corsHeaders } from "@/lib/security/cors";

describe("corsHeaders", () => {
  afterEach(() => {
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NODE_ENV;
  });

  it("does not fall back to wildcard in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.NEXT_PUBLIC_APP_URL;

    const headers = corsHeaders(
      new Request("https://www.vegalta.es/api/register", {
        headers: { origin: "https://evil.example" },
      })
    );

    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("reflects allowed origin when configured", () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOWED_ORIGIN = "https://www.vegalta.es";

    const headers = corsHeaders(
      new Request("https://www.vegalta.es/api/register", {
        headers: { origin: "https://www.vegalta.es" },
      })
    );

    expect(headers["Access-Control-Allow-Origin"]).toBe("https://www.vegalta.es");
  });

  it("does not expose an allow-origin header for disallowed origins", () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOWED_ORIGIN = "https://www.vegalta.es";

    const headers = corsHeaders(
      new Request("https://www.vegalta.es/api/register", {
        headers: { origin: "https://evil.example" },
      })
    );

    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
  });
});
