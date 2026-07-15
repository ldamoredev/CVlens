import { describe, expect, it } from "vitest";

import { createJobMatchExtractionFixture } from "./contract.test-fixture";
import { JOB_COVERAGE_POINTS, JOB_PRIORITY_WEIGHTS, scoreJobMatch } from "./score";

describe("job-match scoring configuration", () => {
  it("uses explicit priority weights and categorical points", () => {
    expect(JOB_PRIORITY_WEIGHTS).toEqual({
      required: 2,
      preferred: 1,
      unspecified: 1,
    });
    expect(JOB_COVERAGE_POINTS).toEqual({
      covered: 100,
      partial: 50,
      not_demonstrated: 0,
      not_evaluable: null,
    });
  });
});

describe("scoreJobMatch", () => {
  it("returns complete coverage when every requirement is supported", () => {
    expect(scoreJobMatch(createJobMatchExtractionFixture())).toMatchObject({
      coverageScore: 100,
      evidenceCoveragePercent: 100,
      state: "complete",
    });
  });

  it("weights required requirements without allowing text to affect scoring", () => {
    const extraction = createJobMatchExtractionFixture();
    extraction.requirements.push(
      {
        ...extraction.requirements[0],
        requirement: "A preferred skill",
        priority: "preferred",
        coverage: "not_demonstrated",
        cvEvidence: [],
      },
      {
        ...extraction.requirements[0],
        requirement: "An unspecified skill",
        priority: "unspecified",
        coverage: "partial",
      },
    );

    expect(scoreJobMatch(extraction)).toMatchObject({
      coverageScore: 63,
      evidenceCoveragePercent: 100,
      state: "complete",
    });

    extraction.requirements[0].explanation = "Completely different prose.";
    expect(scoreJobMatch(extraction).coverageScore).toBe(63);
  });

  it("excludes non-evaluable requirements and reports evidence coverage", () => {
    const extraction = createJobMatchExtractionFixture();
    extraction.requirements.push({
      ...extraction.requirements[0],
      requirement: "Ambiguous requirement",
      priority: "required",
      coverage: "not_evaluable",
      cvEvidence: [],
      notEvaluableReason: "The requirement cannot be compared reliably.",
    });

    expect(scoreJobMatch(extraction)).toMatchObject({
      coverageScore: 100,
      evidenceCoveragePercent: 50,
      state: "partial",
    });
  });

  it("never turns insufficient information into a zero", () => {
    const extraction = createJobMatchExtractionFixture();
    extraction.requirements[0] = {
      ...extraction.requirements[0],
      coverage: "not_evaluable",
      cvEvidence: [],
      notEvaluableReason: "The requirement cannot be compared reliably.",
    };

    expect(scoreJobMatch(extraction)).toMatchObject({
      coverageScore: null,
      evidenceCoveragePercent: 0,
      state: "insufficient_information",
    });
  });
});
