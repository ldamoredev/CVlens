import type { JobMatchExtraction } from "./contract";

export function createJobMatchExtractionFixture(): JobMatchExtraction {
  return {
    schemaVersion: "1.0",
    requirements: [
      {
        requirement: "TypeScript experience",
        priority: "required",
        requirementEvidence: {
          quote: "Strong TypeScript experience is required.",
          location: "Requirements",
        },
        coverage: "covered",
        explanation: "The CV explicitly shows TypeScript experience.",
        cvEvidence: [
          {
            quote: "Built typed API contracts with TypeScript.",
            location: "Experience",
          },
        ],
        notEvaluableReason: null,
      },
    ],
  };
}
