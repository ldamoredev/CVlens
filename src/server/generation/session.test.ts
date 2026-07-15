import { describe, expect, it } from "vitest";

import { GenerationSessionManager } from "./session-manager";

const SECRET = Buffer.alloc(32, 7);

describe("GenerationSessionManager", () => {
  it("rotates a valid token after one completed generation", () => {
    const manager = new GenerationSessionManager({ secret: SECRET, ttlMs: 10_000 });
    const bytes = Buffer.from("fictional CV");
    const initial = manager.create(bytes, 1_000);
    const started = manager.begin(initial.token, bytes, "ats_focused", 2_000);

    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const next = started.complete();

    expect(next).toMatchObject({
      count: 1,
      remaining: 2,
      usedStrategies: ["ats_focused"],
    });
    expect(next.token).not.toBe(initial.token);
  });

  it("rejects a token presented with a different CV", () => {
    const manager = new GenerationSessionManager({ secret: SECRET });
    const initial = manager.create(Buffer.from("first"), 1_000);

    expect(manager.begin(initial.token, Buffer.from("second"), "ats_focused", 2_000))
      .toEqual({ ok: false, reason: "invalid_session" });
  });

  it("blocks concurrent use and permits a retry after release", () => {
    const manager = new GenerationSessionManager({ secret: SECRET });
    const bytes = Buffer.from("fictional CV");
    const initial = manager.create(bytes, 1_000);
    const first = manager.begin(initial.token, bytes, "ats_focused", 2_000);

    expect(first.ok).toBe(true);
    expect(manager.begin(initial.token, bytes, "impact_focused", 2_000))
      .toEqual({ ok: false, reason: "generation_in_progress" });
    if (!first.ok) return;
    first.release();
    expect(manager.begin(initial.token, bytes, "impact_focused", 2_000).ok).toBe(true);
  });

  it("rejects a consumed token and permits repeating a strategy with the rotated token", () => {
    const manager = new GenerationSessionManager({ secret: SECRET });
    const bytes = Buffer.from("fictional CV");
    const initial = manager.create(bytes, 1_000);
    const first = manager.begin(initial.token, bytes, "ats_focused", 2_000);
    if (!first.ok) throw new Error("Expected a valid first generation.");
    const next = first.complete();

    expect(manager.begin(initial.token, bytes, "impact_focused", 2_000))
      .toEqual({ ok: false, reason: "invalid_session" });
    expect(manager.begin(next.token, bytes, "ats_focused", 2_000).ok).toBe(true);
  });

  it("enforces at most three sequential generations", () => {
    const manager = new GenerationSessionManager({ secret: SECRET });
    const bytes = Buffer.from("fictional CV");
    let state = manager.create(bytes, 1_000);

    for (let index = 0; index < 3; index += 1) {
      const started = manager.begin(state.token, bytes, "ats_focused", 2_000);
      if (!started.ok) throw new Error("Expected a valid generation.");
      state = started.complete();
    }

    expect(state).toMatchObject({ count: 3, remaining: 0 });
    expect(manager.begin(state.token, bytes, "concise", 2_000))
      .toEqual({ ok: false, reason: "generation_limit" });
  });

  it("rejects expired and tampered tokens", () => {
    const manager = new GenerationSessionManager({ secret: SECRET, ttlMs: 100 });
    const bytes = Buffer.from("fictional CV");
    const state = manager.create(bytes, 1_000);

    expect(manager.begin(state.token, bytes, "ats_focused", 1_101))
      .toEqual({ ok: false, reason: "invalid_session" });
    expect(manager.begin(`${state.token}x`, bytes, "ats_focused", 1_050))
      .toEqual({ ok: false, reason: "invalid_session" });
  });
});
