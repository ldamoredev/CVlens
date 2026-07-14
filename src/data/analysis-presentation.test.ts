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
      coveragePercent: 100,
      language: "en",
      overallScore: 100,
      source: "live_upload",
      status: "success",
    });
    expect(result?.dimensions).toHaveLength(5);
    expect(result?.dimensions.flatMap((dimension) => dimension.findings)).toHaveLength(18);
    expect(
      result?.dimensions.flatMap((dimension) => dimension.findings).every((finding) =>
        finding.evidence.length > 0 &&
        finding.points === 100 &&
        finding.recommendation.length > 20,
      ),
    ).toBe(true);
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

  it("keeps non-evaluable criteria visible and excluded from scoring", () => {
    const extraction = createValidExtractionFixture();
    extraction.dimensions.atsStructure.completeContactInformation = {
      outcome: "not_evaluable",
      explanation: "Contact values are intentionally excluded from the report.",
      evidence: [],
      notEvaluableReason: "Only privacy-safe categories may be evaluated.",
    };

    const result = createAnalysisPresentation(
      extraction,
      scoreExtraction(extraction),
      metadata,
    );
    const contact = result?.dimensions
      .flatMap((dimension) => dimension.findings)
      .find((finding) => finding.id.endsWith("completeContactInformation"));

    expect(result?.status).toBe("partial");
    expect(contact).toMatchObject({
      effect: "not_evaluable",
      evidence: [],
      outcomeLabel: "Not evaluable",
      points: null,
      weight: 20,
    });
    expect(contact?.recommendation).toContain("never reproduces their values");
  });

  it("localizes criterion labels and guidance from the CV language", () => {
    const extraction = createValidExtractionFixture();
    extraction.document = {
      language: "es",
      languageEvidence: [{ quote: "Experiencia profesional", location: "Encabezado" }],
      languageReason: null,
    };
    extraction.dimensions.impact.resultOrientedBullets.outcome = "needs_improvement";

    const result = createAnalysisPresentation(
      extraction,
      scoreExtraction(extraction),
      metadata,
    );
    const first = result?.dimensions[0]?.findings[0];

    expect(first).toMatchObject({
      label: "Bullets orientados a resultados",
      outcomeLabel: "A mejorar",
      points: 0,
    });
    expect(first?.recommendation).toContain("Aplicá este ajuste");
  });
});
