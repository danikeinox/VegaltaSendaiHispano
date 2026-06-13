import { describe, expect, it } from "vitest";
import { extractTurnstileToken } from "@/lib/security/turnstile";

describe("extractTurnstileToken", () => {
  it("reads turnstileToken from JSON body", () => {
    expect(extractTurnstileToken({ turnstileToken: "abc123" })).toBe("abc123");
  });

  it("returns undefined when token is missing", () => {
    expect(extractTurnstileToken({ email: "a@b.c" })).toBeUndefined();
    expect(extractTurnstileToken(null)).toBeUndefined();
    expect(extractTurnstileToken("invalid")).toBeUndefined();
  });
});
