import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { cvExtractionSchema, type CvExtraction } from "../../domain/extraction/contract";
import {
  ANALYSIS_DEADLINE_MS,
  EXTRACTION_MAX_TOKENS,
  EXTRACTION_TIMEOUT_MS,
  resolveAnthropicModel,
} from "./model";
import {
  AnthropicRequestError,
  classifyAnthropicError,
} from "./provider-error";
import {
  EXTRACTION_ANALYSIS_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
} from "./prompts";
import {
  ExtractionValidationError,
  extractWithSingleReinspection,
} from "./reinspection";
import {
  createCvContentBlock,
  type AnthropicInputDocument,
} from "./document-content";

export class AnthropicConfigurationError extends Error {
  constructor() {
    super("Anthropic is not configured on the server.");
    this.name = "AnthropicConfigurationError";
  }
}

let anthropicClient: Anthropic | undefined;

function getAnthropicClient(): Anthropic {
  if (anthropicClient) return anthropicClient;

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new AnthropicConfigurationError();

  anthropicClient = new Anthropic({
    apiKey,
    logLevel: "off",
    maxRetries: 0,
    timeout: EXTRACTION_TIMEOUT_MS,
  });

  return anthropicClient;
}

function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

async function invokeExtraction(
  client: Anthropic,
  document: AnthropicInputDocument,
  prompt: string,
  signal: AbortSignal,
): Promise<string> {
  const message = await client.messages.create(
    {
      model: resolveAnthropicModel(process.env.ANTHROPIC_MODEL),
      max_tokens: EXTRACTION_MAX_TOKENS,
      temperature: 0,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            createCvContentBlock(document),
            { type: "text", text: prompt },
          ],
        },
      ],
      output_config: {
        format: zodOutputFormat(cvExtractionSchema),
      },
    },
    { signal },
  );

  return extractText(message);
}

export async function extractCvWithAnthropic(
  document: AnthropicInputDocument,
  requestSignal?: AbortSignal,
): Promise<CvExtraction> {
  const client = getAnthropicClient();
  const controller = new AbortController();
  const abortFromRequest = () => controller.abort();
  requestSignal?.addEventListener("abort", abortFromRequest, { once: true });
  if (requestSignal?.aborted) controller.abort();
  const deadline = setTimeout(() => controller.abort(), ANALYSIS_DEADLINE_MS);

  try {
    return await extractWithSingleReinspection({
      initial: () => invokeExtraction(
        client,
        document,
        EXTRACTION_ANALYSIS_PROMPT,
        controller.signal,
      ),
      reinspect: (prompt) => invokeExtraction(client, document, prompt, controller.signal),
    });
  } catch (error) {
    if (
      error instanceof AnthropicRequestError ||
      error instanceof ExtractionValidationError
    ) {
      throw error;
    }
    throw new AnthropicRequestError(classifyAnthropicError(error));
  } finally {
    clearTimeout(deadline);
    requestSignal?.removeEventListener("abort", abortFromRequest);
  }
}
