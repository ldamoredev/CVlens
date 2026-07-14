import { describe, expect, it } from "vitest";

import { previewStatesEnabled } from "./preview-state-policy";

describe("preview state policy", () => {
  it("keeps QA previews available outside production", () => {
    expect(previewStatesEnabled("development", undefined)).toBe(true);
    expect(previewStatesEnabled("test", undefined)).toBe(true);
  });

  it("requires an explicit server-side flag in production", () => {
    expect(previewStatesEnabled("production", undefined)).toBe(false);
    expect(previewStatesEnabled("production", "false")).toBe(false);
    expect(previewStatesEnabled("production", "true")).toBe(true);
  });
});
