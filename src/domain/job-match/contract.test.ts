import { describe, expect, it } from "vitest";

import {
  jobMatchExtractionSchema,
  validateRequirementQuotes,
} from "./contract";
import { createJobMatchExtractionFixture } from "./contract.test-fixture";

describe("jobMatchExtractionSchema", () => {
  it("accepts an evidence-backed requirement without model scores", () => {
    expect(jobMatchExtractionSchema.parse(createJobMatchExtractionFixture()))
      .toEqual(createJobMatchExtractionFixture());
  });

  it.each(["covered", "partial"] as const)(
    "requires CV evidence for %s coverage",
    (coverage) => {
      const extraction = createJobMatchExtractionFixture();
      extraction.requirements[0].coverage = coverage;
      extraction.requirements[0].cvEvidence = [];

      expect(jobMatchExtractionSchema.safeParse(extraction).success).toBe(false);
    },
  );

  it("allows not_demonstrated only without claimed evidence or a reason", () => {
    const extraction = createJobMatchExtractionFixture();
    extraction.requirements[0] = {
      ...extraction.requirements[0],
      coverage: "not_demonstrated",
      cvEvidence: [],
      notEvaluableReason: null,
    };

    expect(jobMatchExtractionSchema.safeParse(extraction).success).toBe(true);

    extraction.requirements[0].cvEvidence = [
      { quote: "A contradictory claim", location: "Experience" },
    ];
    expect(jobMatchExtractionSchema.safeParse(extraction).success).toBe(false);
  });

  it("requires an explicit reason when comparison is not evaluable", () => {
    const extraction = createJobMatchExtractionFixture();
    extraction.requirements[0] = {
      ...extraction.requirements[0],
      coverage: "not_evaluable",
      cvEvidence: [],
      notEvaluableReason: null,
    };

    expect(jobMatchExtractionSchema.safeParse(extraction).success).toBe(false);

    extraction.requirements[0].notEvaluableReason =
      "The requirement is too ambiguous to compare.";
    expect(jobMatchExtractionSchema.safeParse(extraction).success).toBe(true);
  });

  it("rejects scores, extra fields and contact data", () => {
    const extraction = createJobMatchExtractionFixture();
    const unsafe = {
      ...extraction,
      score: 100,
      requirements: [
        {
          ...extraction.requirements[0],
          explanation: "Contact candidate@example.com",
        },
      ],
    };

    expect(jobMatchExtractionSchema.safeParse(unsafe).success).toBe(false);
  });
});

describe("validateRequirementQuotes", () => {
  it("accepts only requirement quotes copied exactly from the submitted job", () => {
    const extraction = createJobMatchExtractionFixture();
    const description = [
      "About the role",
      extraction.requirements[0].requirementEvidence.quote,
    ].join("\n");

    expect(validateRequirementQuotes(description, extraction)).toEqual({
      valid: true,
      invalidRequirementIndexes: [],
    });

    extraction.requirements[0].requirementEvidence.quote =
      "Five years of TypeScript experience are required.";
    expect(validateRequirementQuotes(description, extraction)).toEqual({
      valid: false,
      invalidRequirementIndexes: [0],
    });
  });
});
