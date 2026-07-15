import "server-only";

import {
  type AnalysisApiError,
  type AnalysisApiErrorCode,
} from "../../../domain/analysis/result";
import {
  AnthropicConfigurationError,
  extractCvWithAnthropic,
  extractGroundedCvWithAnthropic,
} from "../../../server/anthropic/analyze-document";
import { validateOptionalJobDescription } from "../../../domain/job-match/job-description";
import { selectAnalysisExtraction } from "../../../server/analysis/select-extraction";
import { AnthropicRequestError } from "../../../server/anthropic/provider-error";
import { ExtractionValidationError } from "../../../server/anthropic/reinspection";
import {
  beginAnalysisMetric,
  type AnalysisOutcome,
} from "../../../server/observability/metrics";
import {
  consumeAnalysisRateLimit,
  rateLimitHeaders,
  type RateLimitDecision,
} from "../../../server/security/rate-limit";
import {
  resolveClientAddress,
  validateAnalyzeRequestHeaders,
} from "../../../server/security/request-policy";
import { runUploadPipeline } from "../../../server/upload/pipeline";
import { UploadPreparationError } from "../../../server/upload/prepare-upload";

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
    ...(retryAfterSeconds
      ? { "Retry-After": String(retryAfterSeconds) }
      : {}),
  };
}

function errorResponse(
  code: AnalysisApiErrorCode,
  status: number,
  rateLimit: RateLimitDecision,
  retryAfterSeconds?: number,
): Response {
  return Response.json(
    { error: { code } } satisfies AnalysisApiError,
    {
      status,
      headers: responseHeaders(rateLimit, retryAfterSeconds),
    },
  );
}

export async function POST(request: Request): Promise<Response> {
  const metric = beginAnalysisMetric();
  let outcome: AnalysisOutcome = "technical_error";
  const rateLimit = consumeAnalysisRateLimit(resolveClientAddress(request.headers));

  try {
    if (!rateLimit.allowed) {
      outcome = "rate_limited";
      return errorResponse(
        "rate_limited",
        429,
        rateLimit,
        rateLimit.retryAfterSeconds,
      );
    }

    const policy = validateAnalyzeRequestHeaders(request.headers);
    if (!policy.valid) {
      if (policy.reason === "request_too_large") {
        outcome = "invalid_upload";
        return errorResponse("file_too_large", 413, rateLimit);
      }

      outcome = "invalid_request";
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
      outcome = "invalid_request";
      return errorResponse("invalid_request", 400, rateLimit);
    }
    const file = formData.get("file");
    const jobDescription = validateOptionalJobDescription(
      formData.get("jobDescription"),
    );

    if (!(file instanceof File)) {
      outcome = "invalid_upload";
      return errorResponse("invalid_format", 400, rateLimit);
    }

    if (!jobDescription.ok) {
      outcome = "invalid_request";
      return errorResponse("invalid_request", 400, rateLimit);
    }

    const result = await runUploadPipeline(
      file,
      (document) => selectAnalysisExtraction(
        document,
        jobDescription.value,
        request.signal,
        {
          extractCv: extractCvWithAnthropic,
          extractGrounded: extractGroundedCvWithAnthropic,
        },
      ),
    );
    outcome = "success";
    return Response.json(result, {
      status: 200,
      headers: responseHeaders(rateLimit),
    });
  } catch (error) {
    if (error instanceof UploadPreparationError) {
      outcome = "invalid_upload";
      if (error.code === "file_too_large") {
        return errorResponse("file_too_large", 413, rateLimit);
      }
      return errorResponse("invalid_format", 415, rateLimit);
    }

    if (error instanceof ExtractionValidationError) {
      outcome = "insufficient";
      return errorResponse("insufficient", 422, rateLimit);
    }

    if (error instanceof AnthropicConfigurationError) {
      outcome = "technical_error";
      return errorResponse("technical_error", 503, rateLimit);
    }

    if (error instanceof AnthropicRequestError) {
      if (error.reason === "timeout") {
        outcome = "timeout";
        return errorResponse("timeout", 504, rateLimit);
      }

      outcome = "provider_error";
      if (error.reason === "connection") {
        return errorResponse("provider_unavailable", 502, rateLimit);
      }
      if (error.reason === "rate_limited" || error.reason === "provider") {
        return errorResponse("provider_busy", 503, rateLimit);
      }
      return errorResponse("technical_error", 503, rateLimit);
    }

    outcome = "technical_error";
    return errorResponse("technical_error", 502, rateLimit);
  } finally {
    metric.finish(outcome);
  }
}
