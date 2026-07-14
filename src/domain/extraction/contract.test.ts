import { describe, expect, it } from "vitest";

import { createValidExtractionFixture } from "./contract.test-fixture";
import { containsContactValue, cvExtractionSchema } from "./contract";

describe("cvExtractionSchema", () => {
  it("accepts a complete evidence-backed extraction with no scores", () => {
    const extraction = createValidExtractionFixture();
    const result = cvExtractionSchema.safeParse(extraction);

    expect(result.success).toBe(true);
    expect(JSON.stringify(extraction)).not.toMatch(/score|rating|percentage/i);
  });

  it("rejects score fields at every strict contract boundary", () => {
    const extraction = createValidExtractionFixture();
    const withScore = {
      ...extraction,
      overallScore: 88,
      dimensions: {
        ...extraction.dimensions,
        impact: {
          ...extraction.dimensions.impact,
          resultOrientedBullets: {
            ...extraction.dimensions.impact.resultOrientedBullets,
            score: 10,
          },
        },
      },
    };

    expect(cvExtractionSchema.safeParse(withScore).success).toBe(false);
  });

  it("requires verbatim evidence for every evaluated criterion", () => {
    const extraction = createValidExtractionFixture();
    extraction.dimensions.impact.quantifiedAchievements.evidence = [];

    const result = cvExtractionSchema.safeParse(extraction);

    expect(result.success).toBe(false);
  });

  it("requires an explicit reason and no claimed evidence when not evaluable", () => {
    const missingReason = createValidExtractionFixture();
    missingReason.dimensions.consistency.unexplainedDateGaps = {
      outcome: "not_evaluable",
      explanation: "The dates are not legible.",
      evidence: [],
      notEvaluableReason: null,
    };

    const claimedEvidence = createValidExtractionFixture();
    claimedEvidence.dimensions.consistency.unexplainedDateGaps = {
      outcome: "not_evaluable",
      explanation: "The dates are not legible.",
      evidence: [
        {
          quote: "20?? — 20??",
          location: "Experience",
        },
      ],
      notEvaluableReason: "The scan is too blurred to read the dates.",
    };

    expect(cvExtractionSchema.safeParse(missingReason).success).toBe(false);
    expect(cvExtractionSchema.safeParse(claimedEvidence).success).toBe(false);
  });

  it("represents ambiguous language without guessing", () => {
    const extraction = createValidExtractionFixture();
    extraction.document = {
      language: "undetermined",
      languageEvidence: [],
      languageReason: "The document has no readable natural-language text.",
    };

    expect(cvExtractionSchema.safeParse(extraction).success).toBe(true);
  });

  it("rejects incomplete dimensions instead of silently omitting a criterion", () => {
    const extraction = createValidExtractionFixture();
    const incompleteClarity: Partial<typeof extraction.dimensions.clarity> = {
      ...extraction.dimensions.clarity,
    };
    delete incompleteClarity.passiveVoice;
    const incomplete = {
      ...extraction,
      dimensions: {
        ...extraction.dimensions,
        clarity: incompleteClarity,
      },
    };

    expect(cvExtractionSchema.safeParse(incomplete).success).toBe(false);
  });

  it.each([
    "candidate@example.com",
    "https://portfolio.example.com",
    "github.com/candidate",
    "+54 11 5555 1234",
  ])("detects contact values before they can reach the response: %s", (value) => {
    expect(containsContactValue(value)).toBe(true);
  });

  it("rejects contact values in evidence and explanatory text", () => {
    const evidenceLeak = createValidExtractionFixture();
    evidenceLeak.dimensions.atsStructure.completeContactInformation.evidence[0].quote =
      "candidate@example.com";

    const explanationLeak = createValidExtractionFixture();
    explanationLeak.dimensions.atsStructure.completeContactInformation.explanation =
      "The CV lists candidate@example.com.";

    expect(cvExtractionSchema.safeParse(evidenceLeak).success).toBe(false);
    expect(cvExtractionSchema.safeParse(explanationLeak).success).toBe(false);
  });
});
