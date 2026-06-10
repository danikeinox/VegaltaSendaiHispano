import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/security/error-handler";

describe("getClientIp", () => {
  it("prefers CF-Connecting-IP over forwarded headers", () => {
    const request = new Request("https://www.vegalta.es", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-forwarded-for": "198.51.100.1, 203.0.113.99",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.10");
  });
});
