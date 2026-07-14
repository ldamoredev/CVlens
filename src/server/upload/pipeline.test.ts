import { describe, expect, it, vi } from "vitest";

import { createValidExtractionFixture } from "../../domain/extraction/contract.test-fixture";
import { runUploadPipeline } from "./pipeline";
import type { UploadFileLike } from "./prepare-upload";

function pdfFile(): UploadFileLike {
  const bytes = Buffer.from("%PDF-1.7\nfictional fixture\n%%EOF");
  return {
    type: "application/pdf",
    size: bytes.length,
    arrayBuffer: async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
  };
}

describe("runUploadPipeline", () => {
  it("passes only validated findings into the deterministic rubric", async () => {
    const extract = vi.fn().mockResolvedValue(createValidExtractionFixture());

    const result = await runUploadPipeline(pdfFile(), extract);

    expect(extract).toHaveBeenCalledTimes(1);
    expect(result.rubric).toMatchObject({
      state: "complete",
      overallScore: 100,
      coveragePercent: 100,
    });
  });

  it("zeroes the prepared bytes after success", async () => {
    let capturedBytes: Buffer | undefined;

    await runUploadPipeline(pdfFile(), async (upload) => {
      capturedBytes = upload.bytes;
      return createValidExtractionFixture();
    });

    expect(capturedBytes).toBeDefined();
    expect(capturedBytes?.every((byte) => byte === 0)).toBe(true);
  });

  it("zeroes the prepared bytes when extraction fails", async () => {
    let capturedBytes: Buffer | undefined;
    const providerError = new Error("provider unavailable");

    await expect(
      runUploadPipeline(pdfFile(), async (upload) => {
        capturedBytes = upload.bytes;
        throw providerError;
      }),
    ).rejects.toBe(providerError);

    expect(capturedBytes).toBeDefined();
    expect(capturedBytes?.every((byte) => byte === 0)).toBe(true);
  });
});
