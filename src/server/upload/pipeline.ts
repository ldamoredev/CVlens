import type { CvExtraction } from "../../domain/extraction/contract";
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

export type ExtractPreparedUpload = (
  upload: Pick<PreparedUpload, "bytes" | "mediaType">,
) => Promise<CvExtraction>;

export async function runUploadPipeline(
  file: UploadFileLike,
  extract: ExtractPreparedUpload,
): Promise<CvAnalysisResult> {
  const upload = await prepareUpload(file);

  try {
    const extraction = await extract({
      bytes: upload.bytes,
      mediaType: upload.mediaType,
    });
    return buildAnalysisResult(extraction);
  } finally {
    disposePreparedUpload(upload);
  }
}
