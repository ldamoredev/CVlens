import { z } from "zod";

import { containsContactValue } from "../extraction/contract";

export const GENERATION_STRATEGIES = [
  "ats_focused",
  "impact_focused",
  "concise",
] as const;

export type GenerationStrategy = (typeof GENERATION_STRATEGIES)[number];

export const generationEvidenceSchema = z
  .object({
    quote: z
      .string()
      .trim()
      .min(1)
      .max(600)
      .describe("A short verbatim excerpt copied exactly from the submitted CV."),
    location: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .describe("A non-sensitive section or entry label that locates the quote."),
  })
  .strict();

export const generatedClaimSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .describe("Rewritten CV text supported entirely by the cited source excerpts."),
    evidence: z
      .array(generationEvidenceSchema)
      .min(1)
      .max(3)
      .describe("One to three verbatim CV excerpts supporting every fact in text."),
  })
  .strict()
  .superRefine((claim, context) => {
    if (containsContactValue(claim.text)) {
      context.addIssue({
        code: "custom",
        message: "Contact values are allowed only in the generated header contact block.",
        path: ["text"],
      });
    }
    claim.evidence.forEach((evidence, index) => {
      if (
        containsContactValue(evidence.quote) ||
        containsContactValue(evidence.location)
      ) {
        context.addIssue({
          code: "custom",
          message: "Claim evidence cannot reproduce contact values.",
          path: ["evidence", index],
        });
      }
    });
  });

export const generatedEntitySchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1)
      .max(240)
      .describe("An entity copied verbatim from the submitted CV."),
    evidence: z
      .array(generationEvidenceSchema)
      .min(1)
      .max(2)
      .describe("Verbatim CV evidence containing the exact entity text."),
  })
  .strict()
  .superRefine((entity, context) => {
    if (!entity.evidence.some((evidence) => evidence.quote.includes(entity.text))) {
      context.addIssue({
        code: "custom",
        message: "Generated entities must occur verbatim in their source evidence.",
        path: ["text"],
      });
    }
  });

const nonContactGeneratedEntitySchema = generatedEntitySchema.superRefine(
  (entity, context) => {
    if (containsContactValue(entity.text)) {
      context.addIssue({
        code: "custom",
        message: "Contact values are allowed only in the generated header contact block.",
        path: ["text"],
      });
    }
    entity.evidence.forEach((evidence, index) => {
      if (
        containsContactValue(evidence.quote) ||
        containsContactValue(evidence.location)
      ) {
        context.addIssue({
          code: "custom",
          message: "Entity evidence cannot reproduce contact values outside the contact block.",
          path: ["evidence", index],
        });
      }
    });
  },
);

const experienceEntrySchema = z
  .object({
    role: nonContactGeneratedEntitySchema,
    organization: nonContactGeneratedEntitySchema.nullable(),
    dates: nonContactGeneratedEntitySchema.nullable(),
    location: nonContactGeneratedEntitySchema.nullable(),
    bullets: z.array(generatedClaimSchema).min(1).max(8),
  })
  .strict();

const projectEntrySchema = z
  .object({
    name: nonContactGeneratedEntitySchema,
    context: nonContactGeneratedEntitySchema.nullable(),
    dates: nonContactGeneratedEntitySchema.nullable(),
    bullets: z.array(generatedClaimSchema).min(1).max(6),
  })
  .strict();

const educationEntrySchema = z
  .object({
    credential: nonContactGeneratedEntitySchema,
    institution: nonContactGeneratedEntitySchema.nullable(),
    dates: nonContactGeneratedEntitySchema.nullable(),
    details: z.array(generatedClaimSchema).max(4),
  })
  .strict();

const additionalSectionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .describe("A conventional organizational section label, not a factual claim."),
    items: z.array(generatedClaimSchema).min(1).max(8),
  })
  .strict();

export const generatedCvSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    language: z.enum(["es", "en"]),
    strategy: z.enum(GENERATION_STRATEGIES),
    header: z
      .object({
        name: nonContactGeneratedEntitySchema.nullable(),
        headline: generatedClaimSchema.nullable(),
        contact: z.array(generatedEntitySchema).max(6),
      })
      .strict(),
    summary: z.array(generatedClaimSchema).max(4),
    experience: z.array(experienceEntrySchema).max(10),
    projects: z.array(projectEntrySchema).max(8),
    education: z.array(educationEntrySchema).max(6),
    skills: z.array(nonContactGeneratedEntitySchema).max(30),
    additionalSections: z.array(additionalSectionSchema).max(6),
  })
  .strict()
  .superRefine((cv, context) => {
    const contentCount =
      cv.summary.length +
      cv.experience.length +
      cv.projects.length +
      cv.education.length +
      cv.skills.length +
      cv.additionalSections.length;

    if (contentCount === 0) {
      context.addIssue({
        code: "custom",
        message: "A generated CV must contain at least one source-backed section.",
        path: ["summary"],
      });
    }
  });

export type GenerationEvidence = z.infer<typeof generationEvidenceSchema>;
export type GeneratedClaim = z.infer<typeof generatedClaimSchema>;
export type GeneratedEntity = z.infer<typeof generatedEntitySchema>;
export type GeneratedCv = z.infer<typeof generatedCvSchema>;

export const generationSessionStateSchema = z
  .object({
    token: z.string().min(20).max(2_000),
    count: z.number().int().min(0).max(3),
    remaining: z.number().int().min(0).max(3),
    usedStrategies: z.array(z.enum(GENERATION_STRATEGIES)).max(3),
  })
  .strict()
  .superRefine((session, context) => {
    if (session.count + session.remaining !== 3) {
      context.addIssue({
        code: "custom",
        message: "Generation count and remaining quota must total three.",
        path: ["remaining"],
      });
    }
    if (session.count !== session.usedStrategies.length) {
      context.addIssue({
        code: "custom",
        message: "The strategy history must match the generation count.",
        path: ["usedStrategies"],
      });
    }
  });

export const generationApiResponseSchema = z
  .object({
    generation: generatedCvSchema,
    session: generationSessionStateSchema,
  })
  .strict();

export type GenerationSessionState = z.infer<typeof generationSessionStateSchema>;
export type GenerationApiResponse = z.infer<typeof generationApiResponseSchema>;

export const GENERATION_API_ERROR_CODES = [
  "file_too_large",
  "generation_in_progress",
  "generation_limit",
  "insufficient",
  "invalid_format",
  "invalid_request",
  "invalid_session",
  "provider_busy",
  "provider_unavailable",
  "rate_limited",
  "technical_error",
  "timeout",
] as const;

export type GenerationApiErrorCode = (typeof GENERATION_API_ERROR_CODES)[number];

export const generationApiErrorSchema = z
  .object({
    error: z.object({ code: z.enum(GENERATION_API_ERROR_CODES) }).strict(),
  })
  .strict();

export type GenerationApiError = z.infer<typeof generationApiErrorSchema>;
