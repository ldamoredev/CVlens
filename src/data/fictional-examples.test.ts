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
        expect(dimension.quote.length).toBeGreaterThan(0);
      }
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
    expect(partial?.dimensions.every((dimension) => dimension.recommendation.length > 0)).toBe(
      true,
    );
  });
});
