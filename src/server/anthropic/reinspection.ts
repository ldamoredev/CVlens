import {
  cvExtractionSchema,
  type CvExtraction,
} from "../../domain/extraction/contract";
import {
  jobMatchExtractionSchema,
  validateRequirementQuotes,
  type JobMatchExtraction,
} from "../../domain/job-match/contract";

import {
  buildJobMatchReinspectionPrompt,
  buildReinspectionPrompt,
} from "./prompts";

export interface ExtractionValidationIssue {
  path: string;
  code: string;
}

export class ExtractionValidationError extends Error {
  readonly issues: readonly ExtractionValidationIssue[];

  constructor(issues: readonly ExtractionValidationIssue[]) {
    super("Anthropic extraction did not satisfy the CVLens contract.");
    this.name = "ExtractionValidationError";
    this.issues = issues;
  }
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new ExtractionValidationError([{ path: "$", code: "invalid_json" }]);
  }
}

export function parseExtractionOutput(value: unknown): CvExtraction {
  const parsedJson = parseJson(value);
  const result = cvExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new ExtractionValidationError(
      result.error.issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "$",
        code: issue.code,
      })),
    );
  }

  return result.data;
}

export function parseJobMatchExtractionOutput(
  value: unknown,
  jobDescription: string,
): JobMatchExtraction {
  const parsedJson = parseJson(value);
  const result = jobMatchExtractionSchema.safeParse(parsedJson);

  if (!result.success) {
    throw new ExtractionValidationError(
      result.error.issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "$",
        code: issue.code,
      })),
    );
  }

  const quoteValidation = validateRequirementQuotes(
    jobDescription,
    result.data,
  );
  if (!quoteValidation.valid) {
    throw new ExtractionValidationError(
      quoteValidation.invalidRequirementIndexes.map((index) => ({
        path: `requirements.${index}.requirementEvidence.quote`,
        code: "not_verbatim_job_evidence",
      })),
    );
  }

  return result.data;
}

export interface ExtractionAttempts {
  initial: () => Promise<unknown>;
  reinspect: (prompt: string) => Promise<unknown>;
}

export async function extractWithSingleReinspection(
  attempts: ExtractionAttempts,
): Promise<CvExtraction> {
  let initialOutput: unknown;

  try {
    initialOutput = await attempts.initial();
    return parseExtractionOutput(initialOutput);
  } catch (error) {
    if (!(error instanceof ExtractionValidationError)) {
      throw error;
    }

    initialOutput = undefined;
    const reinspectionPrompt = buildReinspectionPrompt(error.issues);
    const reinspectionOutput = await attempts.reinspect(reinspectionPrompt);
    return parseExtractionOutput(reinspectionOutput);
  }
}

export async function extractJobMatchWithSingleReinspection(
  attempts: ExtractionAttempts,
  jobDescription: string,
): Promise<JobMatchExtraction> {
  try {
    return parseJobMatchExtractionOutput(
      await attempts.initial(),
      jobDescription,
    );
  } catch (error) {
    if (!(error instanceof ExtractionValidationError)) {
      throw error;
    }

    const reinspectionPrompt = buildJobMatchReinspectionPrompt(
      jobDescription,
      error.issues,
    );
    return parseJobMatchExtractionOutput(
      await attempts.reinspect(reinspectionPrompt),
      jobDescription,
    );
  }
}
