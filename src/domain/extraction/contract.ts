import { z } from "zod";

export const DOCUMENT_LANGUAGES = ["es", "en", "undetermined"] as const;
export const FINDING_OUTCOMES = [
  "meets",
  "needs_improvement",
  "mixed",
  "not_evaluable",
] as const;

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const contactUrlPattern = /(?:https?:\/\/|www\.|github\.com|linkedin\.com)/i;
const phonePattern = /(?:\+|\()?\d(?:[\s().-]*\d){9,}/;

export function containsContactValue(value: string): boolean {
  return (
    emailPattern.test(value) ||
    contactUrlPattern.test(value) ||
    phonePattern.test(value)
  );
}

export const evidenceQuoteSchema = z
  .object({
    quote: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .describe("A verbatim excerpt copied from the CV."),
    location: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .describe("A non-sensitive section or entry label that helps locate the quote."),
  })
  .strict()
  .superRefine((evidence, context) => {
    if (containsContactValue(evidence.quote)) {
      context.addIssue({
        code: "custom",
        message: "Evidence must not reproduce contact values.",
        path: ["quote"],
      });
    }

    if (containsContactValue(evidence.location)) {
      context.addIssue({
        code: "custom",
        message: "Evidence locations must not reproduce contact values.",
        path: ["location"],
      });
    }
  });

export const criterionFindingSchema = z
  .object({
    outcome: z
      .enum(FINDING_OUTCOMES)
      .describe("The evidence-backed outcome for this criterion; never a score."),
    explanation: z
      .string()
      .trim()
      .min(1)
      .max(800)
      .describe("A concise observation written in the detected CV language."),
    evidence: z
      .array(evidenceQuoteSchema)
      .max(3)
      .describe("Up to three verbatim CV excerpts. Empty only when not evaluable."),
    notEvaluableReason: z
      .string()
      .trim()
      .min(1)
      .max(400)
      .nullable()
      .describe("Why the criterion cannot be evaluated, otherwise null."),
  })
  .strict()
  .superRefine((finding, context) => {
    if (containsContactValue(finding.explanation)) {
      context.addIssue({
        code: "custom",
        message: "Explanations must not reproduce contact values.",
        path: ["explanation"],
      });
    }

    if (
      finding.notEvaluableReason !== null &&
      containsContactValue(finding.notEvaluableReason)
    ) {
      context.addIssue({
        code: "custom",
        message: "Non-evaluable reasons must not reproduce contact values.",
        path: ["notEvaluableReason"],
      });
    }

    if (finding.outcome === "not_evaluable") {
      if (finding.evidence.length > 0) {
        context.addIssue({
          code: "custom",
          message: "A not-evaluable finding cannot claim supporting evidence.",
          path: ["evidence"],
        });
      }

      if (finding.notEvaluableReason === null) {
        context.addIssue({
          code: "custom",
          message: "A not-evaluable finding requires a reason.",
          path: ["notEvaluableReason"],
        });
      }

      return;
    }

    if (finding.evidence.length === 0) {
      context.addIssue({
        code: "custom",
        message: "An evaluated finding requires verbatim CV evidence.",
        path: ["evidence"],
      });
    }

    if (finding.notEvaluableReason !== null) {
      context.addIssue({
        code: "custom",
        message: "An evaluated finding must set notEvaluableReason to null.",
        path: ["notEvaluableReason"],
      });
    }
  });

const documentSchema = z
  .object({
    language: z
      .enum(DOCUMENT_LANGUAGES)
      .describe("Primary CV language detected from the document itself."),
    languageEvidence: z
      .array(evidenceQuoteSchema)
      .max(3)
      .describe("Short verbatim excerpts that establish the detected language."),
    languageReason: z
      .string()
      .trim()
      .min(1)
      .max(400)
      .nullable()
      .describe("Why language is undetermined, otherwise null."),
  })
  .strict()
  .superRefine((document, context) => {
    if (
      document.languageReason !== null &&
      containsContactValue(document.languageReason)
    ) {
      context.addIssue({
        code: "custom",
        message: "Language reasons must not reproduce contact values.",
        path: ["languageReason"],
      });
    }

    if (document.language === "undetermined") {
      if (document.languageEvidence.length > 0) {
        context.addIssue({
          code: "custom",
          message: "Undetermined language cannot include language evidence.",
          path: ["languageEvidence"],
        });
      }

      if (document.languageReason === null) {
        context.addIssue({
          code: "custom",
          message: "Undetermined language requires a reason.",
          path: ["languageReason"],
        });
      }

      return;
    }

    if (document.languageEvidence.length === 0) {
      context.addIssue({
        code: "custom",
        message: "A detected language requires verbatim language evidence.",
        path: ["languageEvidence"],
      });
    }

    if (document.languageReason !== null) {
      context.addIssue({
        code: "custom",
        message: "A detected language must set languageReason to null.",
        path: ["languageReason"],
      });
    }
  });

const impactSchema = z
  .object({
    resultOrientedBullets: criterionFindingSchema,
    quantifiedAchievements: criterionFindingSchema,
    actionVerbOpenings: criterionFindingSchema,
  })
  .strict();

const claritySchema = z
  .object({
    bulletLength: criterionFindingSchema,
    emptyJargon: criterionFindingSchema,
    passiveVoice: criterionFindingSchema,
    tenseConsistency: criterionFindingSchema,
  })
  .strict();

const atsStructureSchema = z
  .object({
    standardSections: criterionFindingSchema,
    reverseChronologicalOrder: criterionFindingSchema,
    parserSafeFormat: criterionFindingSchema,
    completeContactInformation: criterionFindingSchema,
    appropriateLength: criterionFindingSchema,
  })
  .strict();

const consistencySchema = z
  .object({
    unexplainedDateGaps: criterionFindingSchema,
    contradictoryDates: criterionFindingSchema,
    overlappingDates: criterionFindingSchema,
    dateFormatConsistency: criterionFindingSchema,
  })
  .strict();

const domainSignalSchema = z
  .object({
    experienceBackedSkills: criterionFindingSchema,
    unsupportedSkillList: criterionFindingSchema,
  })
  .strict();

export const cvExtractionSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    document: documentSchema,
    dimensions: z
      .object({
        impact: impactSchema,
        clarity: claritySchema,
        atsStructure: atsStructureSchema,
        consistency: consistencySchema,
        domainSignal: domainSignalSchema,
      })
      .strict(),
  })
  .strict();

export type EvidenceQuote = z.infer<typeof evidenceQuoteSchema>;
export type CriterionFinding = z.infer<typeof criterionFindingSchema>;
export type CvExtraction = z.infer<typeof cvExtractionSchema>;
