import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import {
  GENERATION_STRATEGIES,
  type GenerationSessionState,
  type GenerationStrategy,
} from "../../domain/generation/contract";

export const GENERATION_SESSION_TTL_MS = 30 * 60 * 1_000;
export const GENERATION_MAX_COUNT = 3;
const MAX_SESSION_RESERVATIONS = 10_000;

const sessionPayloadSchema = z
  .object({
    version: z.literal(1),
    fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    count: z.number().int().min(0).max(GENERATION_MAX_COUNT),
    usedStrategies: z.array(z.enum(GENERATION_STRATEGIES)).max(GENERATION_MAX_COUNT),
    expiresAt: z.number().int().positive(),
    id: z.string().regex(/^[a-f0-9]{32}$/),
  })
  .strict()
  .superRefine((payload, context) => {
    if (payload.count !== payload.usedStrategies.length) {
      context.addIssue({ code: "custom", message: "Count mismatch.", path: ["count"] });
    }
  });

type SessionPayload = z.infer<typeof sessionPayloadSchema>;
interface Reservation { expiresAt: number; state: "reserved" | "used" }

export type GenerationSessionFailure =
  | "generation_in_progress"
  | "generation_limit"
  | "invalid_session";

export type GenerationSessionStart =
  | { ok: false; reason: GenerationSessionFailure }
  | { ok: true; complete: () => GenerationSessionState; release: () => void };

interface GenerationSessionManagerOptions {
  maxReservations?: number;
  secret?: Buffer;
  ttlMs?: number;
}

export class GenerationSessionManager {
  private readonly maxReservations: number;
  private readonly reservations = new Map<string, Reservation>();
  private readonly secret: Buffer;
  private readonly ttlMs: number;

  constructor(options: GenerationSessionManagerOptions = {}) {
    this.maxReservations = options.maxReservations ?? MAX_SESSION_RESERVATIONS;
    this.secret = options.secret ?? randomBytes(32);
    this.ttlMs = options.ttlMs ?? GENERATION_SESSION_TTL_MS;
  }

  create(bytes: Buffer, now = Date.now()): GenerationSessionState {
    return this.toPublicState({
      version: 1,
      fingerprint: this.fingerprint(bytes),
      count: 0,
      usedStrategies: [],
      expiresAt: now + this.ttlMs,
      id: randomBytes(16).toString("hex"),
    });
  }

  begin(
    token: string,
    bytes: Buffer,
    strategy: GenerationStrategy,
    now = Date.now(),
  ): GenerationSessionStart {
    this.removeExpiredReservations(now);
    const payload = this.verify(token, now);
    if (!payload || payload.fingerprint !== this.fingerprint(bytes)) {
      return { ok: false, reason: "invalid_session" };
    }
    if (payload.count >= GENERATION_MAX_COUNT) {
      return { ok: false, reason: "generation_limit" };
    }
    const reservationKey = createHash("sha256").update(token).digest("hex");
    const existing = this.reservations.get(reservationKey);
    if (existing?.state === "reserved") {
      return { ok: false, reason: "generation_in_progress" };
    }
    if (existing?.state === "used") return { ok: false, reason: "invalid_session" };

    this.reserve(reservationKey, payload.expiresAt);
    let settled = false;
    return {
      ok: true,
      complete: () => {
        if (settled) throw new Error("Generation reservation was already settled.");
        settled = true;
        this.reservations.set(reservationKey, { expiresAt: payload.expiresAt, state: "used" });
        return this.toPublicState({
          ...payload,
          count: payload.count + 1,
          usedStrategies: [...payload.usedStrategies, strategy],
          id: randomBytes(16).toString("hex"),
        });
      },
      release: () => {
        if (settled) return;
        settled = true;
        this.reservations.delete(reservationKey);
      },
    };
  }

  private fingerprint(bytes: Buffer): string {
    return createHmac("sha256", this.secret).update(bytes).digest("hex");
  }

  private sign(encodedPayload: string): string {
    return createHmac("sha256", this.secret).update(encodedPayload).digest("base64url");
  }

  private token(payload: SessionPayload): string {
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${encodedPayload}.${this.sign(encodedPayload)}`;
  }

  private verify(token: string, now: number): SessionPayload | null {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, suppliedSignature] = parts;
    if (!encodedPayload || !suppliedSignature) return null;
    const expected = Buffer.from(this.sign(encodedPayload));
    const supplied = Buffer.from(suppliedSignature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

    try {
      const value: unknown = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
      const parsed = sessionPayloadSchema.safeParse(value);
      return parsed.success && parsed.data.expiresAt > now ? parsed.data : null;
    } catch {
      return null;
    }
  }

  private toPublicState(payload: SessionPayload): GenerationSessionState {
    return {
      token: this.token(payload),
      count: payload.count,
      remaining: GENERATION_MAX_COUNT - payload.count,
      usedStrategies: payload.usedStrategies,
    };
  }

  private reserve(key: string, expiresAt: number): void {
    if (this.reservations.size >= this.maxReservations) {
      const oldestKey = this.reservations.keys().next().value as string | undefined;
      if (oldestKey) this.reservations.delete(oldestKey);
    }
    this.reservations.set(key, { expiresAt, state: "reserved" });
  }

  private removeExpiredReservations(now: number): void {
    for (const [key, reservation] of this.reservations) {
      if (reservation.expiresAt <= now) this.reservations.delete(key);
    }
  }
}
