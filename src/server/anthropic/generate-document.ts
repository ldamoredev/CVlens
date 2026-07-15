import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import {
  generatedCvSchema,
  type GeneratedCv,
  type GenerationStrategy,
} from "../../domain/generation/contract";
import { createCvContentBlock, type AnthropicInputDocument } from "./document-content";
import {
  buildGenerationPrompt,
  GENERATION_SYSTEM_PROMPT,
} from "./generation-prompts";
import {
  GenerationValidationError,
  generateWithSingleReinspection,
} from "./generation-reinspection";
import {
  ANALYSIS_DEADLINE_MS,
  EXTRACTION_TIMEOUT_MS,
  GENERATION_MAX_TOKENS,
  resolveAnthropicModel,
} from "./model";
import { AnthropicConfigurationError } from "./analyze-document";
import { AnthropicRequestError, classifyAnthropicError } from "./provider-error";

let generationClient: Anthropic | undefined;

function getGenerationClient(): Anthropic {
  if (generationClient) return generationClient;
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new AnthropicConfigurationError();

  generationClient = new Anthropic({
    apiKey,
    logLevel: "off",
    maxRetries: 0,
    timeout: EXTRACTION_TIMEOUT_MS,
  });
  return generationClient;
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

async function invokeGeneration(
  client: Anthropic,
  document: AnthropicInputDocument,
  prompt: string,
  signal: AbortSignal,
): Promise<string> {
  const message = await client.messages.create(
    {
      model: resolveAnthropicModel(process.env.ANTHROPIC_MODEL),
      max_tokens: GENERATION_MAX_TOKENS,
      temperature: 0,
      system: GENERATION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [createCvContentBlock(document), { type: "text", text: prompt }],
        },
      ],
      output_config: { format: zodOutputFormat(generatedCvSchema) },
    },
    { signal },
  );
  return extractText(message);
}

export async function generateCvWithAnthropic(
  document: AnthropicInputDocument,
  strategy: GenerationStrategy,
  jobDescription: string | null,
  requestSignal?: AbortSignal,
): Promise<GeneratedCv> {
  const client = getGenerationClient();
  const controller = new AbortController();
  const abortFromRequest = () => controller.abort();
  requestSignal?.addEventListener("abort", abortFromRequest, { once: true });
  if (requestSignal?.aborted) controller.abort();
  const deadline = setTimeout(() => controller.abort(), ANALYSIS_DEADLINE_MS);

  try {
    return await generateWithSingleReinspection(
      {
        initial: () => invokeGeneration(
          client,
          document,
          buildGenerationPrompt(strategy, jobDescription),
          controller.signal,
        ),
        reinspect: (prompt) => invokeGeneration(client, document, prompt, controller.signal),
      },
      strategy,
      jobDescription,
    );
  } catch (error) {
    if (
      error instanceof AnthropicRequestError ||
      error instanceof GenerationValidationError
    ) {
      throw error;
    }
    throw new AnthropicRequestError(classifyAnthropicError(error));
  } finally {
    clearTimeout(deadline);
    requestSignal?.removeEventListener("abort", abortFromRequest);
  }
}
