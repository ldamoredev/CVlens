import { describe, expect, it } from "vitest";

import {
  MAX_UPLOAD_BYTES,
  detectUploadMediaType,
  validateUploadMetadata,
  validateUploadSignature,
} from "./policy";

describe("upload policy", () => {
  it.each(["application/pdf", "image/jpeg", "image/png"] as const)(
    "accepts non-empty %s metadata at the size boundary",
    (type) => {
      expect(validateUploadMetadata({ type, size: MAX_UPLOAD_BYTES })).toEqual({
        valid: true,
        mediaType: type,
      });
    },
  );

  it("rejects unsupported, empty, unsafe, and oversized metadata", () => {
    expect(validateUploadMetadata({ type: "text/plain", size: 12 })).toEqual({
      valid: false,
      reason: "invalid_format",
    });
    expect(validateUploadMetadata({ type: "image/png", size: 0 })).toEqual({
      valid: false,
      reason: "empty_file",
    });
    expect(
      validateUploadMetadata({ type: "image/png", size: Number.NaN }),
    ).toEqual({ valid: false, reason: "empty_file" });
    expect(
      validateUploadMetadata({
        type: "application/pdf",
        size: MAX_UPLOAD_BYTES + 1,
      }),
    ).toEqual({ valid: false, reason: "file_too_large" });
  });

  it("detects PDF, JPEG, and PNG by signature rather than extension", () => {
    expect(detectUploadMediaType(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]))).toBe(
      "application/pdf",
    );
    expect(detectUploadMediaType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg",
    );
    expect(
      detectUploadMediaType(
        new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      ),
    ).toBe("image/png");
    expect(detectUploadMediaType(new Uint8Array([0x47, 0x49, 0x46]))).toBeNull();
  });

  it("rejects a MIME declaration that disagrees with the bytes", () => {
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

    expect(validateUploadSignature(pdf, "application/pdf").valid).toBe(true);
    expect(validateUploadSignature(pdf, "image/png")).toEqual({
      valid: false,
      reason: "invalid_format",
    });
  });
});
