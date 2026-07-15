import type { CvExtraction } from "../extraction/contract";
import type { JobMatchExtraction } from "../job-match/contract";
import { scoreJobMatch, type JobMatchScore } from "../job-match/score";
import { scoreExtraction, type RubricResult } from "../rubric/rubric";

export interface JobMatchResult {
  extraction: JobMatchExtraction;
  score: JobMatchScore;
}

export interface CvAnalysisResult {
  extraction: CvExtraction;
  jobMatch: JobMatchResult | null;
  rubric: RubricResult;
}

export function buildAnalysisResult(
  extraction: CvExtraction,
  jobMatchExtraction: JobMatchExtraction | null = null,
): CvAnalysisResult {
  return {
    extraction,
    jobMatch: jobMatchExtraction === null
      ? null
      : {
          extraction: jobMatchExtraction,
          score: scoreJobMatch(jobMatchExtraction),
        },
    rubric: scoreExtraction(extraction),
  };
}

export type AnalysisApiErrorCode =
  | "file_too_large"
  | "insufficient"
  | "invalid_format"
  | "invalid_request"
  | "provider_busy"
  | "provider_unavailable"
  | "rate_limited"
  | "timeout"
  | "technical_error";

export interface AnalysisApiError {
  error: {
    code: AnalysisApiErrorCode;
  };
}
