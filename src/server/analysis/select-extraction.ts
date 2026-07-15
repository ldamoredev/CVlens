import type { CvExtraction } from "../../domain/extraction/contract";
import type { JobMatchExtraction } from "../../domain/job-match/contract";
import type { AnthropicInputDocument } from "../anthropic/document-content";
import type { PreparedAnalysisExtraction } from "../upload/pipeline";

export interface AnalysisExtractionProviders {
  extractCv: (
    document: AnthropicInputDocument,
    signal?: AbortSignal,
  ) => Promise<CvExtraction>;
  extractJobMatch: (
    document: AnthropicInputDocument,
    jobDescription: string,
    signal?: AbortSignal,
  ) => Promise<JobMatchExtraction>;
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

  const controller = new AbortController();
  const abortFromRequest = () => controller.abort();
  signal.addEventListener("abort", abortFromRequest, { once: true });
  if (signal.aborted) controller.abort();

  try {
    const [extraction, jobMatch] = await Promise.all([
      providers.extractCv(document, controller.signal),
      providers.extractJobMatch(document, jobDescription, controller.signal),
    ]);
    return { extraction, jobMatch };
  } finally {
    controller.abort();
    signal.removeEventListener("abort", abortFromRequest);
  }
}
