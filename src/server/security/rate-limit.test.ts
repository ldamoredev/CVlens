import { describe, expect, it } from "vitest";

import {
  ANALYSIS_RATE_LIMIT_MAX_REQUESTS,
  GENERATION_RATE_LIMIT_MAX_REQUESTS,
  FixedWindowRateLimiter,
  rateLimitHeaders,
} from "./rate-limit";

describe("FixedWindowRateLimiter", () => {
  it("allows the configured quota and rejects the next request", () => {
    const limiter = new FixedWindowRateLimiter({ limit: 2, windowMs: 10_000 });

    expect(limiter.consume("client", 1_000)).toMatchObject({
      allowed: true,
      remaining: 1,
    });
    expect(limiter.consume("client", 2_000)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
    expect(limiter.consume("client", 3_000)).toMatchObject({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 8,
    });
  });

  it("starts a fresh quota when the window expires", () => {
    const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 1_000 });

    expect(limiter.consume("client", 500).allowed).toBe(true);
    expect(limiter.consume("client", 1_499).allowed).toBe(false);
    expect(limiter.consume("client", 1_500)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
  });

  it("keeps memory bounded when many distinct clients arrive", () => {
    const limiter = new FixedWindowRateLimiter({ maxBuckets: 2 });

    limiter.consume("one", 0);
    limiter.consume("two", 0);
    limiter.consume("three", 0);

    expect(limiter.size).toBe(2);
  });

  it("emits only aggregate quota headers", () => {
    const decision = new FixedWindowRateLimiter({ limit: 1 }).consume("private-ip", 0);
    const headers = new Headers(rateLimitHeaders(decision, 0));

    expect(headers.get("RateLimit-Limit")).toBe("1");
    expect(headers.get("RateLimit-Remaining")).toBe("0");
    expect(headers.get("RateLimit-Reset")).toBe("600");
    expect([...headers.values()].join(" ")).not.toContain("private-ip");
  });

  it("reserves a separate three-request quota for sequential generation", () => {
    expect(ANALYSIS_RATE_LIMIT_MAX_REQUESTS).toBe(3);
    expect(GENERATION_RATE_LIMIT_MAX_REQUESTS).toBe(3);
  });
});
