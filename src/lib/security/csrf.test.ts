import { afterEach, describe, expect, it } from "vitest";
import { validateOrigin } from "@/lib/security/csrf";

describe("validateOrigin", () => {
  afterEach(() => {
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.NODE_ENV;
  });

  it("rejects unknown origins in production", () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOWED_ORIGIN = "https://www.vegalta.es";

    const request = new Request("https://www.vegalta.es/api/register", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
      },
    });

    expect(validateOrigin(request)).toBe(false);
  });

  it("accepts configured site origin", () => {
    process.env.NODE_ENV = "production";
    process.env.ALLOWED_ORIGIN = "https://www.vegalta.es";

    const request = new Request("https://www.vegalta.es/api/register", {
      method: "POST",
      headers: {
        origin: "https://www.vegalta.es",
      },
    });

    expect(validateOrigin(request)).toBe(true);
  });
});
