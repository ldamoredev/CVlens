import type {
  CriterionFinding,
  CvExtraction,
} from "../extraction/contract";

type ExtractionDimensions = CvExtraction["dimensions"];
export type DimensionKey = keyof ExtractionDimensions;
export type ScoreState =
  | "complete"
  | "partial"
  | "insufficient_information";

type CriterionWeights = {
  [Dimension in DimensionKey]: {
    [Criterion in keyof ExtractionDimensions[Dimension]]: number;
  };
};

export const DIMENSION_KEYS = [
  "impact",
  "clarity",
  "atsStructure",
  "consistency",
  "domainSignal",
] as const satisfies readonly DimensionKey[];

export const DIMENSION_WEIGHTS = Object.freeze({
  impact: 30,
  clarity: 20,
  atsStructure: 25,
  consistency: 15,
  domainSignal: 10,
} satisfies Record<DimensionKey, number>);

export const CRITERION_WEIGHTS = Object.freeze({
  impact: Object.freeze({
    resultOrientedBullets: 45,
    quantifiedAchievements: 35,
    actionVerbOpenings: 20,
  }),
  clarity: Object.freeze({
    bulletLength: 25,
    emptyJargon: 25,
    passiveVoice: 25,
    tenseConsistency: 25,
  }),
  atsStructure: Object.freeze({
    standardSections: 20,
    reverseChronologicalOrder: 15,
    parserSafeFormat: 30,
    completeContactInformation: 20,
    appropriateLength: 15,
  }),
  consistency: Object.freeze({
    unexplainedDateGaps: 35,
    contradictoryDates: 30,
    overlappingDates: 20,
    dateFormatConsistency: 15,
  }),
  domainSignal: Object.freeze({
    experienceBackedSkills: 65,
    unsupportedSkillList: 35,
  }),
} satisfies CriterionWeights);

export const OUTCOME_POINTS = Object.freeze({
  meets: 100,
  mixed: 50,
  needs_improvement: 0,
  not_evaluable: null,
} satisfies Record<CriterionFinding["outcome"], number | null>);

export const MINIMUM_OVERALL_COVERAGE_PERCENT = 50;

export interface CriterionScore {
  outcome: CriterionFinding["outcome"];
  points: number | null;
  weight: number;
  weightedContribution: number | null;
}

export interface DimensionScore<Criterion extends string = string> {
  state: ScoreState;
  score: number | null;
  coveragePercent: number;
  criteria: Record<Criterion, CriterionScore>;
}

export type RubricDimensions = {
  [Dimension in DimensionKey]: DimensionScore<
    Extract<keyof ExtractionDimensions[Dimension], string>
  >;
};

export interface RubricResult {
  state: ScoreState;
  overallScore: number | null;
  coveragePercent: number;
  dimensions: RubricDimensions;
}

function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

function roundToOneDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function scoreDimension<Criterion extends string>(
  findings: Record<Criterion, CriterionFinding>,
  weights: Record<Criterion, number>,
): DimensionScore<Criterion> {
  const criterionKeys = Object.keys(weights) as Criterion[];
  let availableWeight = 0;
  let weightedPoints = 0;

  const criteria = Object.fromEntries(
    criterionKeys.map((criterion) => {
      const finding = findings[criterion];
      const weight = weights[criterion];
      const points = OUTCOME_POINTS[finding.outcome];
      const weightedContribution =
        points === null ? null : (points * weight) / 100;

      if (points !== null) {
        availableWeight += weight;
        weightedPoints += (points * weight) / 100;
      }

      return [
        criterion,
        {
          outcome: finding.outcome,
          points,
          weight,
          weightedContribution,
        } satisfies CriterionScore,
      ];
    }),
  ) as Record<Criterion, CriterionScore>;

  if (availableWeight === 0) {
    return {
      state: "insufficient_information",
      score: null,
      coveragePercent: 0,
      criteria,
    };
  }

  return {
    state: availableWeight === 100 ? "complete" : "partial",
    score: roundHalfUp((weightedPoints * 100) / availableWeight),
    coveragePercent: availableWeight,
    criteria,
  };
}

function calculateOverall(
  dimensions: RubricDimensions,
): Pick<RubricResult, "state" | "overallScore" | "coveragePercent"> {
  let availableGlobalWeight = 0;
  let globalWeightedPoints = 0;

  for (const dimensionKey of DIMENSION_KEYS) {
    const dimension = dimensions[dimensionKey];
    const dimensionWeight = DIMENSION_WEIGHTS[dimensionKey];

    availableGlobalWeight +=
      (dimension.coveragePercent * dimensionWeight) / 100;

    for (const criterion of Object.values(dimension.criteria)) {
      if (criterion.weightedContribution !== null) {
        globalWeightedPoints +=
          (criterion.weightedContribution * dimensionWeight) / 100;
      }
    }
  }

  const coveragePercent = roundToOneDecimal(availableGlobalWeight);

  if (availableGlobalWeight < MINIMUM_OVERALL_COVERAGE_PERCENT) {
    return {
      state: "insufficient_information",
      overallScore: null,
      coveragePercent,
    };
  }

  return {
    state: availableGlobalWeight === 100 ? "complete" : "partial",
    overallScore: roundHalfUp(
      (globalWeightedPoints * 100) / availableGlobalWeight,
    ),
    coveragePercent,
  };
}

export function scoreExtraction(extraction: CvExtraction): RubricResult {
  const dimensions: RubricDimensions = {
    impact: scoreDimension(
      extraction.dimensions.impact,
      CRITERION_WEIGHTS.impact,
    ),
    clarity: scoreDimension(
      extraction.dimensions.clarity,
      CRITERION_WEIGHTS.clarity,
    ),
    atsStructure: scoreDimension(
      extraction.dimensions.atsStructure,
      CRITERION_WEIGHTS.atsStructure,
    ),
    consistency: scoreDimension(
      extraction.dimensions.consistency,
      CRITERION_WEIGHTS.consistency,
    ),
    domainSignal: scoreDimension(
      extraction.dimensions.domainSignal,
      CRITERION_WEIGHTS.domainSignal,
    ),
  };

  return {
    ...calculateOverall(dimensions),
    dimensions,
  };
}
