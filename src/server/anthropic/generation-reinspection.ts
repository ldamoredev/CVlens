import {
  generatedCvSchema,
  type GeneratedCv,
  type GenerationStrategy,
} from "../../domain/generation/contract";
import { buildGenerationReinspectionPrompt } from "./generation-prompts";

export interface GenerationValidationIssue {
  path: string;
  code: string;
}

export class GenerationValidationError extends Error {
  readonly issues: readonly GenerationValidationIssue[];

  constructor(issues: readonly GenerationValidationIssue[]) {
    super("Anthropic generation did not satisfy the CVLens grounding contract.");
    this.name = "GenerationValidationError";
    this.issues = issues;
  }
}

function safeValidationCode(
  issue: { code: string; message: string; maximum?: unknown },
): string {
  if (issue.code === "too_big" && typeof issue.maximum === "number") {
    return `too_many_items_max_${issue.maximum}`;
  }
  if (issue.code !== "custom") return issue.code;

  if (issue.message === "Generated entities must occur verbatim in their source evidence.") {
    return "entity_not_verbatim_in_evidence";
  }
  if (issue.message === "A generated CV must contain at least one source-backed section.") {
    return "empty_generated_cv";
  }
  if (issue.message.includes("Contact values are allowed only")) {
    return "contact_value_outside_header";
  }
  if (issue.message === "Claim evidence cannot reproduce contact values.") {
    return "contact_value_in_claim_evidence";
  }
  if (issue.message.startsWith("Entity evidence cannot reproduce contact values")) {
    return "contact_value_in_entity_evidence";
  }
  return "contract_refinement_failed";
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new GenerationValidationError([{ path: "$", code: "invalid_json" }]);
  }
}

export function parseGenerationOutput(
  value: unknown,
  expectedStrategy: GenerationStrategy,
): GeneratedCv {
  const result = generatedCvSchema.safeParse(parseJson(value));
  if (!result.success) {
    throw new GenerationValidationError(
      result.error.issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join(".") : "$",
        code: safeValidationCode(issue),
      })),
    );
  }

  if (result.data.strategy !== expectedStrategy) {
    throw new GenerationValidationError([
      { path: "strategy", code: "unexpected_strategy" },
    ]);
  }

  return result.data;
}

interface GenerationAttempts {
  initial: () => Promise<unknown>;
  reinspect: (prompt: string) => Promise<unknown>;
}

export async function generateWithSingleReinspection(
  attempts: GenerationAttempts,
  strategy: GenerationStrategy,
  jobDescription: string | null,
): Promise<GeneratedCv> {
  try {
    return parseGenerationOutput(await attempts.initial(), strategy);
  } catch (error) {
    if (!(error instanceof GenerationValidationError)) throw error;
    const prompt = buildGenerationReinspectionPrompt(
      strategy,
      jobDescription,
      error.issues,
    );
    return parseGenerationOutput(await attempts.reinspect(prompt), strategy);
  }
}
