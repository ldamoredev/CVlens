import { describe, expect, it } from "vitest";

import { createValidExtractionFixture } from "../extraction/contract.test-fixture";
import type {
  CriterionFinding,
  CvExtraction,
} from "../extraction/contract";
import {
  CRITERION_WEIGHTS,
  DIMENSION_WEIGHTS,
  MINIMUM_OVERALL_COVERAGE_PERCENT,
  OUTCOME_POINTS,
  scoreExtraction,
} from "./rubric";

type Outcome = CriterionFinding["outcome"];

const criterionCases = [
  ["impact", "resultOrientedBullets", 45],
  ["impact", "quantifiedAchievements", 35],
  ["impact", "actionVerbOpenings", 20],
  ["clarity", "bulletLength", 25],
  ["clarity", "emptyJargon", 25],
  ["clarity", "passiveVoice", 25],
  ["clarity", "tenseConsistency", 25],
  ["atsStructure", "standardSections", 20],
  ["atsStructure", "reverseChronologicalOrder", 15],
  ["atsStructure", "parserSafeFormat", 30],
  ["atsStructure", "completeContactInformation", 20],
  ["atsStructure", "appropriateLength", 15],
  ["consistency", "unexplainedDateGaps", 35],
  ["consistency", "contradictoryDates", 30],
  ["consistency", "overlappingDates", 20],
  ["consistency", "dateFormatConsistency", 15],
  ["domainSignal", "experienceBackedSkills", 65],
  ["domainSignal", "unsupportedSkillList", 35],
] as const;

function setOutcome(finding: CriterionFinding, outcome: Outcome): void {
  finding.outcome = outcome;

  if (outcome === "not_evaluable") {
    finding.evidence = [];
    finding.notEvaluableReason = "The criterion cannot be verified.";
    return;
  }

  finding.evidence = [
    {
      quote: "Built payment flows for 30 enterprise clients",
      location: "Experience — Software Engineer",
    },
  ];
  finding.notEvaluableReason = null;
}

function setAllOutcomes(extraction: CvExtraction, outcome: Outcome): void {
  for (const dimension of Object.values(extraction.dimensions)) {
    for (const finding of Object.values(dimension)) {
      setOutcome(finding, outcome);
    }
  }
}

function setDimensionOutcome(
  dimension: Record<string, CriterionFinding>,
  outcome: Outcome,
): void {
  for (const finding of Object.values(dimension)) {
    setOutcome(finding, outcome);
  }
}

function setCriterionOutcome(
  extraction: CvExtraction,
  dimensionKey: keyof CvExtraction["dimensions"],
  criterionKey: string,
  outcome: Outcome,
): void {
  const entry = Object.entries(extraction.dimensions[dimensionKey]).find(
    ([key]) => key === criterionKey,
  );

  if (!entry) {
    throw new Error(`Unknown rubric criterion: ${dimensionKey}.${criterionKey}`);
  }

  setOutcome(entry[1], outcome);
}

describe("rubric configuration", () => {
  it("uses explicit weights that sum to 100 at both levels", () => {
    const dimensionWeightTotal = Object.values(DIMENSION_WEIGHTS).reduce(
      (total, weight) => total + weight,
      0,
    );

    expect(dimensionWeightTotal).toBe(100);

    for (const criterionWeights of Object.values(CRITERION_WEIGHTS)) {
      expect(
        Object.values(criterionWeights).reduce(
          (total, weight) => total + weight,
          0,
        ),
      ).toBe(100);
    }
  });

  it("maps only evaluated categorical outcomes to numeric points", () => {
    expect(OUTCOME_POINTS).toEqual({
      meets: 100,
      mixed: 50,
      needs_improvement: 0,
      not_evaluable: null,
    });
    expect(MINIMUM_OVERALL_COVERAGE_PERCENT).toBe(50);
  });
});

describe("scoreExtraction", () => {
  it("returns a complete 100 when every finding meets the criterion", () => {
    const result = scoreExtraction(createValidExtractionFixture());

    expect(result).toMatchObject({
      state: "complete",
      overallScore: 100,
      coveragePercent: 100,
    });

    for (const dimension of Object.values(result.dimensions)) {
      expect(dimension).toMatchObject({
        state: "complete",
        score: 100,
        coveragePercent: 100,
      });
    }
  });

  it("returns a legitimate complete zero for evaluated negative findings", () => {
    const extraction = createValidExtractionFixture();
    setAllOutcomes(extraction, "needs_improvement");

    const result = scoreExtraction(extraction);

    expect(result).toMatchObject({
      state: "complete",
      overallScore: 0,
      coveragePercent: 100,
    });
    expect(result.dimensions.impact.score).toBe(0);
  });

  it("maps a complete set of mixed findings to 50", () => {
    const extraction = createValidExtractionFixture();
    setAllOutcomes(extraction, "mixed");

    const result = scoreExtraction(extraction);

    expect(result.overallScore).toBe(50);
    expect(result.dimensions.atsStructure.score).toBe(50);
  });

  it("rounds half values upward only after the weighted calculation", () => {
    const extraction = createValidExtractionFixture();
    setOutcome(extraction.dimensions.clarity.bulletLength, "meets");
    setOutcome(extraction.dimensions.clarity.emptyJargon, "mixed");
    setOutcome(extraction.dimensions.clarity.passiveVoice, "mixed");
    setOutcome(extraction.dimensions.clarity.tenseConsistency, "mixed");

    const result = scoreExtraction(extraction);

    expect(result.dimensions.clarity.score).toBe(63);
  });

  it("excludes a non-evaluable criterion instead of turning it into zero", () => {
    const extraction = createValidExtractionFixture();
    setOutcome(
      extraction.dimensions.impact.quantifiedAchievements,
      "not_evaluable",
    );

    const result = scoreExtraction(extraction);
    const criterion =
      result.dimensions.impact.criteria.quantifiedAchievements;

    expect(result.dimensions.impact).toMatchObject({
      state: "partial",
      score: 100,
      coveragePercent: 65,
    });
    expect(criterion).toMatchObject({
      points: null,
      weightedContribution: null,
      weight: 35,
    });
    expect(result).toMatchObject({
      state: "partial",
      overallScore: 100,
      coveragePercent: 89.5,
    });
  });

  it.each(criterionCases)(
    "renormalizes %s.%s when that criterion is not evaluable",
    (dimensionKey, criterionKey, criterionWeight) => {
      const extraction = createValidExtractionFixture();
      setCriterionOutcome(
        extraction,
        dimensionKey,
        criterionKey,
        "not_evaluable",
      );

      const result = scoreExtraction(extraction);
      const dimension = result.dimensions[dimensionKey];
      const rawGlobalCoverage =
        100 - (DIMENSION_WEIGHTS[dimensionKey] * criterionWeight) / 100;
      const expectedGlobalCoverage =
        Math.round((rawGlobalCoverage + Number.EPSILON) * 10) / 10;

      expect(dimension).toMatchObject({
        state: "partial",
        score: 100,
        coveragePercent: 100 - criterionWeight,
      });
      expect(result).toMatchObject({
        state: "partial",
        overallScore: 100,
        coveragePercent: expectedGlobalCoverage,
      });
    },
  );

  it("marks a fully unavailable dimension insufficient without a silent zero", () => {
    const extraction = createValidExtractionFixture();
    setDimensionOutcome(
      extraction.dimensions.consistency,
      "not_evaluable",
    );

    const result = scoreExtraction(extraction);

    expect(result.dimensions.consistency).toMatchObject({
      state: "insufficient_information",
      score: null,
      coveragePercent: 0,
    });
    expect(result).toMatchObject({
      state: "partial",
      overallScore: 100,
      coveragePercent: 85,
    });
  });

  it("withholds the overall score below the global coverage threshold", () => {
    const extraction = createValidExtractionFixture();
    setAllOutcomes(extraction, "not_evaluable");
    setOutcome(
      extraction.dimensions.impact.resultOrientedBullets,
      "meets",
    );

    const result = scoreExtraction(extraction);

    expect(result).toMatchObject({
      state: "insufficient_information",
      overallScore: null,
      coveragePercent: 13.5,
    });
    expect(result.dimensions.impact).toMatchObject({
      state: "partial",
      score: 100,
      coveragePercent: 45,
    });
  });

  it("publishes a partial score exactly at 50 percent global coverage", () => {
    const extraction = createValidExtractionFixture();
    setAllOutcomes(extraction, "not_evaluable");
    setDimensionOutcome(extraction.dimensions.impact, "meets");
    setDimensionOutcome(extraction.dimensions.clarity, "mixed");

    const result = scoreExtraction(extraction);

    expect(result).toMatchObject({
      state: "partial",
      overallScore: 80,
      coveragePercent: 50,
    });
  });

  it("exposes each criterion's fixed points, weight, and contribution", () => {
    const extraction = createValidExtractionFixture();
    setOutcome(extraction.dimensions.impact.resultOrientedBullets, "mixed");

    const result = scoreExtraction(extraction);

    expect(
      result.dimensions.impact.criteria.resultOrientedBullets,
    ).toEqual({
      outcome: "mixed",
      points: 50,
      weight: 45,
      weightedContribution: 22.5,
    });
    expect(result.dimensions.impact.score).toBe(78);
  });

  it("is deterministic and does not mutate its extraction input", () => {
    const extraction = createValidExtractionFixture();
    setOutcome(extraction.dimensions.domainSignal.unsupportedSkillList, "mixed");
    const before = structuredClone(extraction);

    const first = scoreExtraction(extraction);
    const second = scoreExtraction(extraction);

    expect(first).toEqual(second);
    expect(extraction).toEqual(before);
  });

  it("depends on outcomes, not wording or the number of evidence quotes", () => {
    const original = createValidExtractionFixture();
    const reworded = createValidExtractionFixture();
    reworded.dimensions.impact.resultOrientedBullets.explanation =
      "Completely different explanatory wording.";
    reworded.dimensions.impact.resultOrientedBullets.evidence.push({
      quote: "Launched a second documented initiative",
      location: "Projects",
    });

    expect(scoreExtraction(reworded)).toEqual(scoreExtraction(original));
  });
});
