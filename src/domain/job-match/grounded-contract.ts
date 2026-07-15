import { z } from "zod";

import { cvExtractionSchema } from "../extraction/contract";
import { jobMatchExtractionSchema } from "./contract";

export const groundedAnalysisExtractionSchema = z
  .object({
    extraction: cvExtractionSchema,
    jobMatch: jobMatchExtractionSchema,
  })
  .strict();

export type GroundedAnalysisExtraction = z.infer<
  typeof groundedAnalysisExtractionSchema
>;
