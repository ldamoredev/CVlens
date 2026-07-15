import type { CvExtraction } from "../../domain/extraction/contract";
import type { JobMatchExtraction } from "../../domain/job-match/contract";
import {
  buildAnalysisResult,
  type CvAnalysisResult,
} from "../../domain/analysis/result";
import {
  disposePreparedUpload,
  prepareUpload,
  type PreparedUpload,
  type UploadFileLike,
} from "./prepare-upload";

export interface PreparedAnalysisExtraction {
  extraction: CvExtraction;
  jobMatch: JobMatchExtraction | null;
}

export type ExtractPreparedUpload = (
  upload: Pick<PreparedUpload, "bytes" | "mediaType">,
) => Promise<PreparedAnalysisExtraction>;

export async function runUploadPipeline(
  file: UploadFileLike,
  extract: ExtractPreparedUpload,
): Promise<CvAnalysisResult> {
  const upload = await prepareUpload(file);

  try {
    const analysis = await extract({
      bytes: upload.bytes,
      mediaType: upload.mediaType,
    });
    return buildAnalysisResult(analysis.extraction, analysis.jobMatch);
  } finally {
    disposePreparedUpload(upload);
  }
}
