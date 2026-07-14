import { describe, expect, it } from "vitest";

import { fictionalExamples } from "./fictional-examples";

describe("fictional CV presentation fixtures", () => {
  it("defines the three roadmap examples with unique source documents", () => {
    expect(fictionalExamples).toHaveLength(3);
    expect(new Set(fictionalExamples.map((example) => example.sourcePath)).size).toBe(3);
    expect(fictionalExamples.map((example) => [example.language, example.level])).toEqual([
      ["en", "Junior"],
      ["es", "Senior"],
      ["en", "Mid-level"],
    ]);
  });

  it("derives five bounded presentation scores from reviewed cached findings", () => {
    for (const example of fictionalExamples) {
      expect(example.source).toBe("cached_example");
      expect(example.dimensions).toHaveLength(5);
      expect(example.overallScore).toBeGreaterThanOrEqual(0);
      expect(example.overallScore).toBeLessThanOrEqual(100);

      for (const dimension of example.dimensions) {
        if (dimension.score !== null) {
          expect(dimension.score).toBeGreaterThanOrEqual(0);
          expect(dimension.score).toBeLessThanOrEqual(100);
        }
        expect(dimension.findings.length).toBeGreaterThan(0);
        for (const finding of dimension.findings) {
          expect(finding.recommendation.length).toBeGreaterThan(20);
          if (finding.outcome === "not_evaluable") {
            expect(finding.evidence).toEqual([]);
            expect(finding.notEvaluableReason).not.toBeNull();
          } else {
            expect(finding.evidence.length).toBeGreaterThan(0);
          }
        }
      }

      expect(example.dimensions.flatMap((dimension) => dimension.findings)).toHaveLength(18);
    }
  });

  it("keeps partial coverage explicit in the reviewed Spanish example", () => {
    const partial = fictionalExamples.find(
      (example) => example.id === "marina-rivas",
    );

    expect(partial).toBeDefined();
    expect(partial?.status).toBe("partial");
    expect(partial?.language).toBe("es");
    expect(partial?.dimensions.some((dimension) => dimension.effect === "negative")).toBe(
      true,
    );
    expect(
      partial?.dimensions.every((dimension) =>
        dimension.findings.every((finding) => finding.recommendation.length > 0),
      ),
    ).toBe(true);
  });

  it("keeps a privacy-safe complete state for the English junior example", () => {
    const complete = fictionalExamples.find(
      (example) => example.id === "alex-kessler",
    );
    const contact = complete?.dimensions
      .flatMap((dimension) => dimension.findings)
      .find((finding) => finding.id.endsWith("completeContactInformation"));

    expect(complete).toMatchObject({
      coveragePercent: 100,
      language: "en",
      status: "success",
    });
    expect(contact).toMatchObject({
      outcome: "meets",
      points: 100,
    });
    expect(contact?.evidence[0]?.quote).toBe("Contact categories: email · GitHub");
  });
});
