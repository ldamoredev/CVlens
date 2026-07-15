import "server-only";

import {
  GENERATION_STRATEGIES,
  type GenerationApiError,
  type GenerationApiErrorCode,
  type GenerationApiResponse,
  type GenerationStrategy,
} from "../../../domain/generation/contract";
import { validateOptionalJobDescription } from "../../../domain/job-match/job-description";
import { AnthropicConfigurationError } from "../../../server/anthropic/analyze-document";
import { generateCvWithAnthropic } from "../../../server/anthropic/generate-document";
import { GenerationValidationError } from "../../../server/anthropic/generation-reinspection";
import { AnthropicRequestError } from "../../../server/anthropic/provider-error";
import { beginGenerationSession } from "../../../server/generation/session";
import {
  consumeGenerationRateLimit,
  rateLimitHeaders,
  type RateLimitDecision,
} from "../../../server/security/rate-limit";
import {
  resolveClientAddress,
  validateAnalyzeRequestHeaders,
} from "../../../server/security/request-policy";
import {
  disposePreparedUpload,
  prepareUpload,
  UploadPreparationError,
} from "../../../server/upload/prepare-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

function responseHeaders(
  rateLimit: RateLimitDecision,
  retryAfterSeconds?: number,
): HeadersInit {
  return {
    "Cache-Control": "no-store",
    ...rateLimitHeaders(rateLimit),
    ...(retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : {}),
  };
}

function errorResponse(
  code: GenerationApiErrorCode,
  status: number,
  rateLimit: RateLimitDecision,
  retryAfterSeconds?: number,
): Response {
  return Response.json(
    { error: { code } } satisfies GenerationApiError,
    { status, headers: responseHeaders(rateLimit, retryAfterSeconds) },
  );
}

function parseStrategy(value: FormDataEntryValue | null): GenerationStrategy | null {
  return typeof value === "string" &&
    GENERATION_STRATEGIES.includes(value as GenerationStrategy)
    ? value as GenerationStrategy
    : null;
}

function safeSessionStatus(reason: GenerationApiErrorCode): number {
  if (reason === "generation_in_progress") return 409;
  if (reason === "generation_limit") return 409;
  return 403;
}

export async function POST(request: Request): Promise<Response> {
  const rateLimit = consumeGenerationRateLimit(resolveClientAddress(request.headers));
  if (!rateLimit.allowed) {
    return errorResponse("rate_limited", 429, rateLimit, rateLimit.retryAfterSeconds);
  }

  const policy = validateAnalyzeRequestHeaders(request.headers);
  if (!policy.valid) {
    if (policy.reason === "request_too_large") {
      return errorResponse("file_too_large", 413, rateLimit);
    }
    const status = policy.reason === "missing_content_length"
      ? 411
      : policy.reason === "invalid_content_type"
        ? 415
        : policy.reason === "cross_site_request"
          ? 403
          : 400;
    return errorResponse("invalid_request", status, rateLimit);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("invalid_request", 400, rateLimit);
  }

  const file = formData.get("file");
  const token = formData.get("generationToken");
  const strategy = parseStrategy(formData.get("strategy"));
  const jobDescription = validateOptionalJobDescription(formData.get("jobDescription"));
  if (
    !(file instanceof File) ||
    typeof token !== "string" ||
    token.length < 20 ||
    token.length > 2_000 ||
    strategy === null ||
    !jobDescription.ok
  ) {
    return errorResponse("invalid_request", 400, rateLimit);
  }

  try {
    const upload = await prepareUpload(file);
    try {
      const session = beginGenerationSession(token, upload.bytes, strategy);
      if (!session.ok) {
        return errorResponse(session.reason, safeSessionStatus(session.reason), rateLimit);
      }

      try {
        const generation = await generateCvWithAnthropic(
          { bytes: upload.bytes, mediaType: upload.mediaType },
          strategy,
          jobDescription.value,
          request.signal,
        );
        const nextSession = session.complete();
        return Response.json(
          { generation, session: nextSession } satisfies GenerationApiResponse,
          { status: 200, headers: responseHeaders(rateLimit) },
        );
      } catch (error) {
        session.release();
        throw error;
      }
    } finally {
      disposePreparedUpload(upload);
    }
  } catch (error) {
    if (error instanceof UploadPreparationError) {
      return errorResponse(
        error.code === "file_too_large" ? "file_too_large" : "invalid_format",
        error.code === "file_too_large" ? 413 : 415,
        rateLimit,
      );
    }
    if (error instanceof GenerationValidationError) {
      return errorResponse("insufficient", 422, rateLimit);
    }
    if (error instanceof AnthropicConfigurationError) {
      return errorResponse("technical_error", 503, rateLimit);
    }
    if (error instanceof AnthropicRequestError) {
      if (error.reason === "timeout") return errorResponse("timeout", 504, rateLimit);
      if (error.reason === "request" || error.reason === "authentication") {
        return errorResponse("technical_error", 502, rateLimit);
      }
      if (error.reason === "connection") {
        return errorResponse("provider_unavailable", 502, rateLimit);
      }
      if (error.reason === "rate_limited" || error.reason === "provider") {
        return errorResponse("provider_busy", 503, rateLimit);
      }
      return errorResponse("technical_error", 503, rateLimit);
    }
    return errorResponse("technical_error", 502, rateLimit);
  }
}
