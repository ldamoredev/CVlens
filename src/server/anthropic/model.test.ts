import { describe, expect, it } from "vitest";

import {
  ANALYSIS_DEADLINE_MS,
  DEFAULT_ANTHROPIC_MODEL,
  EXTRACTION_MAX_TOKENS,
  EXTRACTION_TIMEOUT_MS,
  resolveAnthropicModel,
} from "./model";

describe("Anthropic model configuration", () => {
  it("uses the pinned Haiku default when no override is configured", () => {
    expect(resolveAnthropicModel(undefined)).toBe(DEFAULT_ANTHROPIC_MODEL);
    expect(resolveAnthropicModel("   ")).toBe(DEFAULT_ANTHROPIC_MODEL);
    expect(DEFAULT_ANTHROPIC_MODEL).toBe("claude-haiku-4-5-20251001");
  });

  it("preserves a deliberate model override and bounds output", () => {
    expect(resolveAnthropicModel(" custom-model ")).toBe("custom-model");
    expect(EXTRACTION_MAX_TOKENS).toBe(6_000);
    expect(EXTRACTION_TIMEOUT_MS).toBe(60_000);
    expect(ANALYSIS_DEADLINE_MS).toBe(75_000);
  });
});
