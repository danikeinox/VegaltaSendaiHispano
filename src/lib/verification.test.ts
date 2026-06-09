import { beforeEach, describe, expect, it } from "vitest";
import {
  createPublicVerificationToken,
  generateAccessToken,
  hashAccessToken,
  verifyPrivateAccessToken,
  verifyPublicVerificationToken,
} from "@/lib/verification";

describe("verification tokens", () => {
  beforeEach(() => {
    process.env.MEMBER_VERIFICATION_SECRET = "test-secret-for-unit-tests-only";
  });

  it("uses distinct public and private token models", () => {
    const member = {
      id: "member-1",
      displayId: "VS-0001",
      accessTokenHash: hashAccessToken("private-token-value"),
    };

    const publicToken = createPublicVerificationToken(member.displayId);
    expect(verifyPublicVerificationToken(member.displayId, publicToken)).toBe(
      true
    );
    expect(verifyPrivateAccessToken(member, publicToken)).toBe(false);
    expect(verifyPrivateAccessToken(member, "private-token-value")).toBe(true);
  });

  it("generates high-entropy access tokens", () => {
    const a = generateAccessToken();
    const b = generateAccessToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(30);
  });
});
