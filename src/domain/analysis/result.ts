import type { CvExtraction } from "../extraction/contract";
import { scoreExtraction, type RubricResult } from "../rubric/rubric";

export interface CvAnalysisResult {
  extraction: CvExtraction;
  rubric: RubricResult;
}

export function buildAnalysisResult(
  extraction: CvExtraction,
): CvAnalysisResult {
  return {
    extraction,
    rubric: scoreExtraction(extraction),
  };
}

export type AnalysisApiErrorCode =
  | "file_too_large"
  | "insufficient"
  | "invalid_format"
  | "technical_error";

export interface AnalysisApiError {
  error: {
    code: AnalysisApiErrorCode;
  };
}
