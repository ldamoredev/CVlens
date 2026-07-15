import type {
  JobMatchExtraction,
  JobRequirementMatch,
} from "./contract";

export const JOB_PRIORITY_WEIGHTS = {
  required: 2,
  preferred: 1,
  unspecified: 1,
} as const satisfies Record<JobRequirementMatch["priority"], number>;

export const JOB_COVERAGE_POINTS = {
  covered: 100,
  partial: 50,
  not_demonstrated: 0,
  not_evaluable: null,
} as const satisfies Record<JobRequirementMatch["coverage"], number | null>;

export type JobMatchScoreState =
  | "complete"
  | "partial"
  | "insufficient_information";

export interface ScoredJobRequirement {
  points: number | null;
  weight: number;
  weightedContribution: number | null;
}

export interface JobMatchScore {
  coverageScore: number | null;
  evidenceCoveragePercent: number;
  requirements: ScoredJobRequirement[];
  state: JobMatchScoreState;
}

function roundToOneDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

export function scoreJobMatch(extraction: JobMatchExtraction): JobMatchScore {
  const requirements = extraction.requirements.map((requirement) => {
    const weight = JOB_PRIORITY_WEIGHTS[requirement.priority];
    const points = JOB_COVERAGE_POINTS[requirement.coverage];

    return {
      points,
      weight,
      weightedContribution: points === null ? null : points * weight,
    };
  });

  const totalWeight = requirements.reduce(
    (total, requirement) => total + requirement.weight,
    0,
  );
  const evaluatedWeight = requirements.reduce(
    (total, requirement) =>
      total + (requirement.points === null ? 0 : requirement.weight),
    0,
  );
  const weightedPoints = requirements.reduce(
    (total, requirement) =>
      total + (requirement.weightedContribution ?? 0),
    0,
  );

  if (evaluatedWeight === 0) {
    return {
      coverageScore: null,
      evidenceCoveragePercent: 0,
      requirements,
      state: "insufficient_information",
    };
  }

  return {
    coverageScore: Math.round(weightedPoints / evaluatedWeight),
    evidenceCoveragePercent: roundToOneDecimal(
      (evaluatedWeight / totalWeight) * 100,
    ),
    requirements,
    state: evaluatedWeight === totalWeight ? "complete" : "partial",
  };
}
