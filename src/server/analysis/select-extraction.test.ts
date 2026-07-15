import { describe, expect, it, vi } from "vitest";

import { createValidExtractionFixture } from "../../domain/extraction/contract.test-fixture";
import { createJobMatchExtractionFixture } from "../../domain/job-match/contract.test-fixture";
import { selectAnalysisExtraction } from "./select-extraction";

const document = {
  bytes: Buffer.from("fictional"),
  mediaType: "application/pdf",
} as const;

describe("selectAnalysisExtraction", () => {
  it("preserves the original CV-only extraction path when no job is supplied", async () => {
    const extraction = createValidExtractionFixture();
    const extractCv = vi.fn().mockResolvedValue(extraction);
    const extractGrounded = vi.fn();
    const signal = new AbortController().signal;

    await expect(
      selectAnalysisExtraction(document, null, signal, {
        extractCv,
        extractGrounded,
      }),
    ).resolves.toEqual({ extraction, jobMatch: null });

    expect(extractCv).toHaveBeenCalledWith(document, signal);
    expect(extractGrounded).not.toHaveBeenCalled();
  });

  it("uses the grounded path only when a validated job is supplied", async () => {
    const extraction = createValidExtractionFixture();
    const jobMatch = createJobMatchExtractionFixture();
    const extractCv = vi.fn();
    const extractGrounded = vi.fn().mockResolvedValue({ extraction, jobMatch });
    const signal = new AbortController().signal;
    const jobDescription = "Strong TypeScript experience is required.";

    await expect(
      selectAnalysisExtraction(document, jobDescription, signal, {
        extractCv,
        extractGrounded,
      }),
    ).resolves.toEqual({ extraction, jobMatch });

    expect(extractGrounded).toHaveBeenCalledWith(
      document,
      jobDescription,
      signal,
    );
    expect(extractCv).not.toHaveBeenCalled();
  });
});
