import { z } from "zod";

import {
  containsContactValue,
  evidenceQuoteSchema,
} from "../extraction/contract";

export const JOB_REQUIREMENT_PRIORITIES = [
  "required",
  "preferred",
  "unspecified",
] as const;

export const JOB_COVERAGE_STATES = [
  "covered",
  "partial",
  "not_demonstrated",
  "not_evaluable",
] as const;

export const MAX_JOB_REQUIREMENTS = 12;

const jobDescriptionEvidenceSchema = z
  .object({
    quote: z.string().trim().min(1).max(500),
    location: z.string().trim().min(1).max(120),
  })
  .strict()
  .superRefine((evidence, context) => {
    if (containsContactValue(evidence.quote)) {
      context.addIssue({
        code: "custom",
        message: "Requirement evidence must not reproduce contact values.",
        path: ["quote"],
      });
    }

    if (containsContactValue(evidence.location)) {
      context.addIssue({
        code: "custom",
        message: "Requirement locations must not reproduce contact values.",
        path: ["location"],
      });
    }
  });

export const jobRequirementMatchSchema = z
  .object({
    requirement: z.string().trim().min(1).max(240),
    priority: z.enum(JOB_REQUIREMENT_PRIORITIES),
    requirementEvidence: jobDescriptionEvidenceSchema,
    coverage: z.enum(JOB_COVERAGE_STATES),
    explanation: z.string().trim().min(1).max(800),
    cvEvidence: z.array(evidenceQuoteSchema).max(3),
    notEvaluableReason: z.string().trim().min(1).max(400).nullable(),
  })
  .strict()
  .superRefine((match, context) => {
    for (const [key, value] of [
      ["requirement", match.requirement],
      ["explanation", match.explanation],
      ["notEvaluableReason", match.notEvaluableReason],
    ] as const) {
      if (value !== null && containsContactValue(value)) {
        context.addIssue({
          code: "custom",
          message: "Job-match output must not reproduce contact values.",
          path: [key],
        });
      }
    }

    if (match.coverage === "covered" || match.coverage === "partial") {
      if (match.cvEvidence.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Covered and partial requirements need verbatim CV evidence.",
          path: ["cvEvidence"],
        });
      }

      if (match.notEvaluableReason !== null) {
        context.addIssue({
          code: "custom",
          message: "An evaluated requirement cannot have a non-evaluable reason.",
          path: ["notEvaluableReason"],
        });
      }

      return;
    }

    if (match.cvEvidence.length > 0) {
      context.addIssue({
        code: "custom",
        message: "An unsupported requirement cannot claim CV evidence.",
        path: ["cvEvidence"],
      });
    }

    if (match.coverage === "not_evaluable") {
      if (match.notEvaluableReason === null) {
        context.addIssue({
          code: "custom",
          message: "A non-evaluable requirement needs a reason.",
          path: ["notEvaluableReason"],
        });
      }

      return;
    }

    if (match.notEvaluableReason !== null) {
      context.addIssue({
        code: "custom",
        message: "A requirement not demonstrated in the CV is still evaluable.",
        path: ["notEvaluableReason"],
      });
    }
  });

export const jobMatchExtractionSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    requirements: z
      .array(jobRequirementMatchSchema)
      .min(1)
      .max(MAX_JOB_REQUIREMENTS),
  })
  .strict();

export type JobRequirementMatch = z.infer<typeof jobRequirementMatchSchema>;
export type JobMatchExtraction = z.infer<typeof jobMatchExtractionSchema>;

export interface RequirementQuoteValidationResult {
  valid: boolean;
  invalidRequirementIndexes: number[];
}

export function validateRequirementQuotes(
  jobDescription: string,
  extraction: JobMatchExtraction,
): RequirementQuoteValidationResult {
  const invalidRequirementIndexes = extraction.requirements.flatMap(
    (requirement, index) =>
      jobDescription.includes(requirement.requirementEvidence.quote)
        ? []
        : [index],
  );

  return {
    valid: invalidRequirementIndexes.length === 0,
    invalidRequirementIndexes,
  };
}
