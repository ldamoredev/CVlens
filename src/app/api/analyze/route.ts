import "server-only";

import {
  type AnalysisApiError,
  type AnalysisApiErrorCode,
} from "../../../domain/analysis/result";
import { MAX_MULTIPART_BYTES } from "../../../domain/upload/policy";
import {
  AnthropicConfigurationError,
  extractCvWithAnthropic,
} from "../../../server/anthropic/analyze-document";
import { ExtractionValidationError } from "../../../server/anthropic/reinspection";
import { runUploadPipeline } from "../../../server/upload/pipeline";
import { UploadPreparationError } from "../../../server/upload/prepare-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(
  code: AnalysisApiErrorCode,
  status: number,
): Response {
  return Response.json({ error: { code } } satisfies AnalysisApiError, { status });
}

export async function POST(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    return errorResponse("file_too_large", 413);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("invalid_format", 400);
    }

    const result = await runUploadPipeline(file, extractCvWithAnthropic);
    return Response.json(result, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof UploadPreparationError) {
      if (error.code === "file_too_large") {
        return errorResponse("file_too_large", 413);
      }
      return errorResponse("invalid_format", 415);
    }

    if (error instanceof ExtractionValidationError) {
      return errorResponse("insufficient", 422);
    }

    if (error instanceof AnthropicConfigurationError) {
      return errorResponse("technical_error", 503);
    }

    return errorResponse("technical_error", 502);
  }
}
