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

  it("provides five mock dimensions and only bounded presentation scores", () => {
    for (const example of fictionalExamples) {
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

  it("keeps non-evaluable findings explicit in the partial example", () => {
    const partial = fictionalExamples.find((example) => example.status === "partial");
    const nonEvaluable = partial?.dimensions.find((dimension) => dimension.score === null);

    expect(partial).toBeDefined();
    expect(nonEvaluable?.effect).toBe("not_evaluable");
    expect(nonEvaluable?.finding).toBeTruthy();
    expect(nonEvaluable?.recommendation).toBeTruthy();
  });
});
