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
    const extractJobMatch = vi.fn();
    const signal = new AbortController().signal;

    await expect(
      selectAnalysisExtraction(document, null, signal, {
        extractCv,
        extractJobMatch,
      }),
    ).resolves.toEqual({ extraction, jobMatch: null });

    expect(extractCv).toHaveBeenCalledWith(document, signal);
    expect(extractJobMatch).not.toHaveBeenCalled();
  });

  it("splits CV quality and job matching into parallel strict requests", async () => {
    const extraction = createValidExtractionFixture();
    const jobMatch = createJobMatchExtractionFixture();
    const extractCv = vi.fn().mockResolvedValue(extraction);
    const extractJobMatch = vi.fn().mockResolvedValue(jobMatch);
    const signal = new AbortController().signal;
    const jobDescription = "Strong TypeScript experience is required.";

    await expect(
      selectAnalysisExtraction(document, jobDescription, signal, {
        extractCv,
        extractJobMatch,
      }),
    ).resolves.toEqual({ extraction, jobMatch });

    expect(extractCv).toHaveBeenCalledWith(document, expect.any(AbortSignal));
    expect(extractJobMatch).toHaveBeenCalledWith(
      document,
      jobDescription,
      expect.any(AbortSignal),
    );
  });

  it("aborts both split requests when the browser request is cancelled", async () => {
    const controller = new AbortController();
    const extractCv = vi.fn((_document, signal?: AbortSignal) =>
      new Promise<ReturnType<typeof createValidExtractionFixture>>((_resolve, reject) => {
        if (!signal) return reject(new Error("missing signal"));
        signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      }));
    const extractJobMatch = vi.fn((_document, _job, signal?: AbortSignal) =>
      new Promise<ReturnType<typeof createJobMatchExtractionFixture>>((_resolve, reject) => {
        if (!signal) return reject(new Error("missing signal"));
        signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      }));
    const result = selectAnalysisExtraction(
      document,
      "Strong TypeScript experience is required.",
      controller.signal,
      { extractCv, extractJobMatch },
    );

    controller.abort();

    await expect(result).rejects.toThrow("aborted");
    expect(extractCv).toHaveBeenCalledTimes(1);
    expect(extractJobMatch).toHaveBeenCalledTimes(1);
  });
});
