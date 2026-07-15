import { createHash, randomBytes } from "node:crypto";

export const ANALYSIS_RATE_LIMIT_MAX_REQUESTS = 3;
export const GENERATION_RATE_LIMIT_MAX_REQUESTS = 3;
export const ANALYSIS_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1_000;
const MAX_RATE_LIMIT_BUCKETS = 10_000;

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

interface FixedWindowRateLimiterOptions {
  limit?: number;
  maxBuckets?: number;
  windowMs?: number;
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private readonly limit: number;
  private readonly maxBuckets: number;
  private readonly windowMs: number;

  constructor(options: FixedWindowRateLimiterOptions = {}) {
    this.limit = options.limit ?? ANALYSIS_RATE_LIMIT_MAX_REQUESTS;
    this.maxBuckets = options.maxBuckets ?? MAX_RATE_LIMIT_BUCKETS;
    this.windowMs = options.windowMs ?? ANALYSIS_RATE_LIMIT_WINDOW_MS;
  }

  consume(key: string, now = Date.now()): RateLimitDecision {
    this.removeExpiredBuckets(now);

    const current = this.buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + this.windowMs }
      : current;

    if (!current && this.buckets.size >= this.maxBuckets) {
      const oldestKey = this.buckets.keys().next().value as string | undefined;
      if (oldestKey) this.buckets.delete(oldestKey);
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);

    const allowed = bucket.count <= this.limit;
    return {
      allowed,
      limit: this.limit,
      remaining: Math.max(0, this.limit - bucket.count),
      resetAt: bucket.resetAt,
      retryAfterSeconds: allowed
        ? 0
        : Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
    };
  }

  get size(): number {
    return this.buckets.size;
  }

  private removeExpiredBuckets(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

interface AnalysisRateLimitState {
  limiter: FixedWindowRateLimiter;
  salt: string;
}

const rateLimitGlobal = globalThis as typeof globalThis & {
  __cvlensAnalysisRateLimit?: AnalysisRateLimitState;
  __cvlensGenerationRateLimit?: AnalysisRateLimitState;
};

function getAnalysisRateLimitState(): AnalysisRateLimitState {
  if (!rateLimitGlobal.__cvlensAnalysisRateLimit) {
    rateLimitGlobal.__cvlensAnalysisRateLimit = {
      limiter: new FixedWindowRateLimiter(),
      salt: randomBytes(32).toString("hex"),
    };
  }

  return rateLimitGlobal.__cvlensAnalysisRateLimit;
}

export function consumeAnalysisRateLimit(
  clientAddress: string,
  now = Date.now(),
): RateLimitDecision {
  const state = getAnalysisRateLimitState();
  const opaqueKey = createHash("sha256")
    .update(state.salt)
    .update(clientAddress)
    .digest("hex");

  return state.limiter.consume(opaqueKey, now);
}

function getGenerationRateLimitState(): AnalysisRateLimitState {
  if (!rateLimitGlobal.__cvlensGenerationRateLimit) {
    rateLimitGlobal.__cvlensGenerationRateLimit = {
      limiter: new FixedWindowRateLimiter({
        limit: GENERATION_RATE_LIMIT_MAX_REQUESTS,
      }),
      salt: randomBytes(32).toString("hex"),
    };
  }

  return rateLimitGlobal.__cvlensGenerationRateLimit;
}

export function consumeGenerationRateLimit(
  clientAddress: string,
  now = Date.now(),
): RateLimitDecision {
  const state = getGenerationRateLimitState();
  const opaqueKey = createHash("sha256")
    .update(state.salt)
    .update(clientAddress)
    .digest("hex");

  return state.limiter.consume(opaqueKey, now);
}

export function rateLimitHeaders(
  decision: RateLimitDecision,
  now = Date.now(),
): HeadersInit {
  return {
    "RateLimit-Limit": String(decision.limit),
    "RateLimit-Remaining": String(decision.remaining),
    "RateLimit-Reset": String(
      Math.max(0, Math.ceil((decision.resetAt - now) / 1_000)),
    ),
  };
}
