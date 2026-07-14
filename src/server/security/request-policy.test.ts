import { describe, expect, it } from "vitest";

import { MAX_MULTIPART_BYTES } from "../../domain/upload/policy";
import {
  resolveClientAddress,
  validateAnalyzeRequestHeaders,
} from "./request-policy";

function validHeaders(overrides: Record<string, string> = {}): Headers {
  return new Headers({
    "content-length": "1024",
    "content-type": "multipart/form-data; boundary=cvlens-boundary",
    "sec-fetch-site": "same-origin",
    ...overrides,
  });
}

describe("analyze request policy", () => {
  it("accepts a bounded same-origin multipart request", () => {
    expect(validateAnalyzeRequestHeaders(validHeaders())).toEqual({
      valid: true,
      contentLength: 1024,
    });
  });

  it("rejects missing, malformed, empty, and oversized lengths before parsing", () => {
    const missing = validHeaders();
    missing.delete("content-length");

    expect(validateAnalyzeRequestHeaders(missing)).toEqual({
      valid: false,
      reason: "missing_content_length",
    });
    expect(
      validateAnalyzeRequestHeaders(validHeaders({ "content-length": "1e4" })),
    ).toEqual({ valid: false, reason: "invalid_content_length" });
    expect(
      validateAnalyzeRequestHeaders(validHeaders({ "content-length": "0" })),
    ).toEqual({ valid: false, reason: "invalid_content_length" });
    expect(
      validateAnalyzeRequestHeaders(
        validHeaders({ "content-length": String(MAX_MULTIPART_BYTES + 1) }),
      ),
    ).toEqual({ valid: false, reason: "request_too_large" });
  });

  it("rejects unsupported multipart declarations and browser cross-site posts", () => {
    expect(
      validateAnalyzeRequestHeaders(
        validHeaders({ "content-type": "application/json" }),
      ),
    ).toEqual({ valid: false, reason: "invalid_content_type" });
    expect(
      validateAnalyzeRequestHeaders(
        validHeaders({ "content-type": "multipart/form-data" }),
      ),
    ).toEqual({ valid: false, reason: "invalid_content_type" });
    expect(
      validateAnalyzeRequestHeaders(
        validHeaders({ "sec-fetch-site": "cross-site" }),
      ),
    ).toEqual({ valid: false, reason: "cross_site_request" });
  });

  it("uses the first valid forwarded address without trusting arbitrary text", () => {
    expect(
      resolveClientAddress(
        new Headers({ "x-forwarded-for": "203.0.113.8, 10.0.0.2" }),
      ),
    ).toBe("203.0.113.8");
    expect(
      resolveClientAddress(
        new Headers({ "x-forwarded-for": "spoofed", "x-real-ip": "2001:db8::1" }),
      ),
    ).toBe("2001:db8::1");
    expect(resolveClientAddress(new Headers())).toBe("unknown");
  });
});
