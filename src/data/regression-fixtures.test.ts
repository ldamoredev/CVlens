import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { cvExtractionSchema } from "../domain/extraction/contract";
import { scoreExtraction } from "../domain/rubric/rubric";
import { regressionFixtures } from "./regression-fixtures";

function collectQuotes(
  extraction: (typeof regressionFixtures)[number]["extraction"],
): string[] {
  return [
    ...extraction.document.languageEvidence.map((evidence) => evidence.quote),
    ...Object.values(extraction.dimensions).flatMap((dimension) =>
      Object.values(dimension).flatMap((criterion) =>
        criterion.evidence.map((evidence) => evidence.quote),
      ),
    ),
  ];
}

describe("Phase 7 launch regression corpus", () => {
  it("provides at least five fixtures including Spanish and English documents", () => {
    expect(regressionFixtures.length).toBeGreaterThanOrEqual(5);
    expect(regressionFixtures.some((fixture) => fixture.language === "es")).toBe(
      true,
    );
    expect(regressionFixtures.some((fixture) => fixture.language === "en")).toBe(
      true,
    );
  });

  it("covers the complete, partial, and insufficient-information states", () => {
    const states = new Set(
      regressionFixtures.map((fixture) => fixture.expectedState),
    );
    expect(states).toContain("complete");
    expect(states).toContain("partial");
    expect(states).toContain("insufficient_information");
  });

  it("uses unique fixture ids", () => {
    const ids = regressionFixtures.map((fixture) => fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const fixture of regressionFixtures) {
    describe(`${fixture.id} — ${fixture.label}`, () => {
      it("is schema-valid with the declared document language", () => {
        const parsed = cvExtractionSchema.safeParse(fixture.extraction);
        expect(parsed.success).toBe(true);
        expect(fixture.extraction.document.language).toBe(fixture.language);
      });

      it("keeps every evidence quote verbatim in its fictional source CV", () => {
        const source = readFileSync(resolve(fixture.sourcePath), "utf8");
        for (const quote of collectQuotes(fixture.extraction)) {
          expect(source, `${fixture.id}: ${quote}`).toContain(quote);
        }
      });

      it("scores deterministically to the expected coverage state", () => {
        const first = scoreExtraction(fixture.extraction);
        const second = scoreExtraction(fixture.extraction);

        expect(first).toEqual(second);
        expect(first.state).toBe(fixture.expectedState);

        if (fixture.expectedState === "insufficient_information") {
          expect(first.overallScore).toBeNull();
          expect(first.coveragePercent).toBeLessThan(50);
        } else {
          expect(first.overallScore).not.toBeNull();
          expect(first.overallScore).toBeGreaterThanOrEqual(0);
          expect(first.overallScore).toBeLessThanOrEqual(100);
        }

        if (fixture.expectedState === "complete") {
          expect(first.coveragePercent).toBe(100);
        }
      });
    });
  }
});
