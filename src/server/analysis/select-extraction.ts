import type { CvExtraction } from "../../domain/extraction/contract";
import type { GroundedAnalysisExtraction } from "../../domain/job-match/grounded-contract";
import type { AnthropicInputDocument } from "../anthropic/document-content";
import type { PreparedAnalysisExtraction } from "../upload/pipeline";

export interface AnalysisExtractionProviders {
  extractCv: (
    document: AnthropicInputDocument,
    signal?: AbortSignal,
  ) => Promise<CvExtraction>;
  extractGrounded: (
    document: AnthropicInputDocument,
    jobDescription: string,
    signal?: AbortSignal,
  ) => Promise<GroundedAnalysisExtraction>;
}

export async function selectAnalysisExtraction(
  document: AnthropicInputDocument,
  jobDescription: string | null,
  signal: AbortSignal,
  providers: AnalysisExtractionProviders,
): Promise<PreparedAnalysisExtraction> {
  if (jobDescription === null) {
    return {
      extraction: await providers.extractCv(document, signal),
      jobMatch: null,
    };
  }

  const grounded = await providers.extractGrounded(
    document,
    jobDescription,
    signal,
  );
  return {
    extraction: grounded.extraction,
    jobMatch: grounded.jobMatch,
  };
}
