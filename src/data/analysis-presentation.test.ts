import { describe, expect, it } from "vitest";

import { createValidExtractionFixture } from "../domain/extraction/contract.test-fixture";
import { scoreExtraction } from "../domain/rubric/rubric";
import { createAnalysisPresentation } from "./analysis-presentation";

const metadata = {
  documentName: "candidate.pdf",
  fallbackLanguage: "es" as const,
  level: "CV propio",
  name: "candidate.pdf",
  role: "Documento subido",
  source: "live_upload" as const,
};

describe("createAnalysisPresentation", () => {
  it("uses the detected CV language and deterministic rubric", () => {
    const extraction = createValidExtractionFixture();
    const result = createAnalysisPresentation(
      extraction,
      scoreExtraction(extraction),
      metadata,
    );

    expect(result).toMatchObject({
      language: "en",
      overallScore: 100,
      source: "live_upload",
      status: "success",
    });
    expect(result?.dimensions).toHaveLength(5);
  });

  it("withholds presentation when rubric coverage is insufficient", () => {
    const extraction = createValidExtractionFixture();

    for (const dimension of Object.values(extraction.dimensions)) {
      for (const finding of Object.values(dimension)) {
        finding.outcome = "not_evaluable";
        finding.evidence = [];
        finding.notEvaluableReason = "The source is unreadable.";
      }
    }

    expect(
      createAnalysisPresentation(
        extraction,
        scoreExtraction(extraction),
        metadata,
      ),
    ).toBeNull();
  });

  it("uses the existing interface language only when document language is undetermined", () => {
    const extraction = createValidExtractionFixture();
    extraction.document = {
      language: "undetermined",
      languageEvidence: [],
      languageReason: "No readable natural-language text.",
    };

    expect(
      createAnalysisPresentation(
        extraction,
        scoreExtraction(extraction),
        metadata,
      )?.language,
    ).toBe("es");
  });
});
