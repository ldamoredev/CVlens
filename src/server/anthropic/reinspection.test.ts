import { describe, expect, it, vi } from "vitest";

import { createValidExtractionFixture } from "../../domain/extraction/contract.test-fixture";
import { createJobMatchExtractionFixture } from "../../domain/job-match/contract.test-fixture";

import {
  ExtractionValidationError,
  extractJobMatchWithSingleReinspection,
  extractWithSingleReinspection,
  parseExtractionOutput,
  parseJobMatchExtractionOutput,
} from "./reinspection";

describe("parseExtractionOutput", () => {
  it("accepts either parsed structured output or a JSON string", () => {
    const extraction = createValidExtractionFixture();

    expect(parseExtractionOutput(extraction)).toEqual(extraction);
    expect(parseExtractionOutput(JSON.stringify(extraction))).toEqual(extraction);
  });

  it("reports invalid JSON without retaining raw model output in the error", () => {
    const sensitiveRawValue = "not-json-with-private-cv-data";

    expect(() => parseExtractionOutput(sensitiveRawValue)).toThrow(
      ExtractionValidationError,
    );

    try {
      parseExtractionOutput(sensitiveRawValue);
    } catch (error) {
      expect(error).toBeInstanceOf(ExtractionValidationError);
      expect(String(error)).not.toContain(sensitiveRawValue);
    }
  });
});

describe("extractWithSingleReinspection", () => {
  it("does not reinspect a valid first extraction", async () => {
    const extraction = createValidExtractionFixture();
    const reinspect = vi.fn();

    const result = await extractWithSingleReinspection({
      initial: vi.fn().mockResolvedValue(extraction),
      reinspect,
    });

    expect(result).toEqual(extraction);
    expect(reinspect).not.toHaveBeenCalled();
  });

  it("performs exactly one independent reinspection after schema failure", async () => {
    const extraction = createValidExtractionFixture();
    const initial = vi.fn().mockResolvedValue("{broken json");
    const reinspect = vi.fn().mockResolvedValue(extraction);

    await expect(
      extractWithSingleReinspection({ initial, reinspect }),
    ).resolves.toEqual(extraction);

    expect(initial).toHaveBeenCalledTimes(1);
    expect(reinspect).toHaveBeenCalledTimes(1);
    const prompt = String(reinspect.mock.calls[0]?.[0]);
    expect(prompt).toContain("independently reinspect the original attached CV");
    expect(prompt).toContain("invalid_json");
    expect(prompt).toContain("never scores");
    expect(prompt).not.toContain("broken json");
  });

  it("stops after the single reinspection when the second output is invalid", async () => {
    const initial = vi.fn().mockResolvedValue("invalid");
    const reinspect = vi.fn().mockResolvedValue("still invalid");

    await expect(
      extractWithSingleReinspection({ initial, reinspect }),
    ).rejects.toBeInstanceOf(ExtractionValidationError);

    expect(initial).toHaveBeenCalledTimes(1);
    expect(reinspect).toHaveBeenCalledTimes(1);
  });

  it("does not use schema reinspection for provider or transport errors", async () => {
    const providerError = new Error("provider unavailable");
    const reinspect = vi.fn();

    await expect(
      extractWithSingleReinspection({
        initial: vi.fn().mockRejectedValue(providerError),
        reinspect,
      }),
    ).rejects.toBe(providerError);

    expect(reinspect).not.toHaveBeenCalled();
  });
});

describe("job-match extraction reinspection", () => {
  const jobDescription = [
    "Requirements",
    "Strong TypeScript experience is required.",
  ].join("\n");

  it("validates requirement evidence against the submitted job text", () => {
    const valid = createJobMatchExtractionFixture();
    expect(parseJobMatchExtractionOutput(valid, jobDescription)).toEqual(valid);

    const invalid = createJobMatchExtractionFixture();
    invalid.requirements[0].requirementEvidence.quote =
      "Five years of TypeScript experience are required.";

    expect(() => parseJobMatchExtractionOutput(invalid, jobDescription)).toThrow(
      ExtractionValidationError,
    );
  });

  it("reinspects once after a non-verbatim requirement quote", async () => {
    const invalid = createJobMatchExtractionFixture();
    invalid.requirements[0].requirementEvidence.quote =
      "Five years of TypeScript experience are required.";
    const valid = createJobMatchExtractionFixture();
    const reinspect = vi.fn().mockResolvedValue(valid);

    await expect(
      extractJobMatchWithSingleReinspection(
        {
          initial: vi.fn().mockResolvedValue(invalid),
          reinspect,
        },
        jobDescription,
      ),
    ).resolves.toEqual(valid);

    expect(reinspect).toHaveBeenCalledTimes(1);
    const prompt = String(reinspect.mock.calls[0]?.[0]);
    expect(prompt).toContain("not_verbatim_job_evidence");
    expect(prompt).toContain(JSON.stringify(jobDescription));
    expect(prompt).not.toContain("Five years");
  });
});
