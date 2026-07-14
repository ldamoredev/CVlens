import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { cvExtractionSchema } from "../domain/extraction/contract";
import { scoreExtraction } from "../domain/rubric/rubric";
import {
  cachedExampleExtractions,
  type FictionalExampleId,
} from "./cached-example-extractions";

const sourcePaths: Record<FictionalExampleId, string> = {
  "alex-kessler": "fixtures/cvs/alex-kessler-junior-en.md",
  "marina-rivas": "fixtures/cvs/marina-rivas-senior-es.md",
  "dayo-okafor": "fixtures/cvs/dayo-okafor-mid-en.md",
};

describe("reviewed cached example extractions", () => {
  it("contains three schema-valid fixtures with deterministic scores", () => {
    expect(Object.keys(cachedExampleExtractions)).toHaveLength(3);

    for (const extraction of Object.values(cachedExampleExtractions)) {
      expect(cvExtractionSchema.safeParse(extraction).success).toBe(true);
      expect(scoreExtraction(extraction)).toEqual(scoreExtraction(extraction));
    }
  });

  it("keeps every cached quote verbatim in its fictional source CV", () => {
    for (const [id, extraction] of Object.entries(
      cachedExampleExtractions,
    ) as [FictionalExampleId, (typeof cachedExampleExtractions)[FictionalExampleId]][]) {
      const source = readFileSync(resolve(sourcePaths[id]), "utf8");
      const quotes = [
        ...extraction.document.languageEvidence,
        ...Object.values(extraction.dimensions).flatMap((dimension) =>
          Object.values(dimension).flatMap((criterion) => criterion.evidence),
        ),
      ];

      for (const evidence of quotes) {
        expect(source, `${id}: ${evidence.quote}`).toContain(evidence.quote);
      }
    }
  });

  it("captures the reviewed failure modes rather than blindly trusting model output", () => {
    const marina = cachedExampleExtractions["marina-rivas"];
    const dayo = cachedExampleExtractions["dayo-okafor"];

    expect(marina.dimensions.atsStructure.parserSafeFormat.outcome).toBe(
      "needs_improvement",
    );
    expect(marina.dimensions.consistency.contradictoryDates.outcome).toBe(
      "not_evaluable",
    );
    expect(dayo.dimensions.consistency.contradictoryDates.outcome).toBe(
      "needs_improvement",
    );
    expect(dayo.dimensions.domainSignal.unsupportedSkillList.outcome).toBe(
      "needs_improvement",
    );
  });
});
