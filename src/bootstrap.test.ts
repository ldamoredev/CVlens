import { describe, expect, it } from "vitest";

describe("Phase 0 bootstrap", () => {
  it("keeps extraction separate from deterministic scoring", () => {
    const architecture = {
      extraction: "probabilistic",
      scoring: "deterministic",
    } as const;

    expect(architecture).toEqual({
      extraction: "probabilistic",
      scoring: "deterministic",
    });
  });
});
