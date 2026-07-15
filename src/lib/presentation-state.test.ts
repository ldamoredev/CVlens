import { describe, expect, it } from "vitest";

import {
  MAX_UPLOAD_BYTES,
  normalizePreviewState,
  validateUpload,
} from "./presentation-state";

describe("Phase 1 upload presentation validation", () => {
  it.each(["application/pdf", "image/jpeg", "image/png"])("accepts %s within the limit", (type) => {
    expect(validateUpload({ type, size: MAX_UPLOAD_BYTES })).toEqual({ valid: true });
  });

  it("rejects unsupported formats before size checks", () => {
    expect(validateUpload({ type: "text/plain", size: 12 })).toEqual({
      valid: false,
      reason: "invalid_format",
    });
  });

  it("rejects files above eight megabytes", () => {
    expect(validateUpload({ type: "application/pdf", size: MAX_UPLOAD_BYTES + 1 })).toEqual({
      valid: false,
      reason: "file_too_large",
    });
  });
});

describe("state preview contract", () => {
  it("recognizes every required state used for visual regression", () => {
    const states = [
      "dragging",
      "file_too_large",
      "idle",
      "insufficient",
      "invalid_format",
      "loading",
      "partial",
      "provider_busy",
      "provider_unavailable",
      "rate_limited",
      "selected",
      "success",
      "technical_error",
      "timeout",
    ];

    expect(states.map(normalizePreviewState)).toEqual(states);
  });

  it("falls back safely for unknown external input", () => {
    expect(normalizePreviewState("score=100")).toBe("idle");
    expect(normalizePreviewState(undefined)).toBe("idle");
  });
});
