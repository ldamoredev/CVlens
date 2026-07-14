import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "./csp";

describe("content security policy", () => {
  it("uses a nonce and denies framing and plugins in production", () => {
    const policy = buildContentSecurityPolicy("safe-nonce", false);

    expect(policy).toContain("script-src 'self' 'nonce-safe-nonce' 'strict-dynamic'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).not.toContain("'unsafe-eval'");
  });

  it("permits local development transports only in development", () => {
    const policy = buildContentSecurityPolicy("nonce", true);

    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("connect-src 'self' http: ws:");
  });
});
