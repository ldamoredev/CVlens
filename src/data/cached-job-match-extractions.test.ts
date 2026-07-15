import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { jobMatchExtractionSchema, validateRequirementQuotes } from "../domain/job-match/contract";
import { scoreJobMatch } from "../domain/job-match/score";
import type { FictionalExampleId } from "./cached-example-extractions";
import { cachedJobMatchFixtures } from "./cached-job-match-extractions";

const cvPaths: Record<FictionalExampleId, string> = {
  "alex-kessler": "fixtures/cvs/alex-kessler-junior-en.md",
  "marina-rivas": "fixtures/cvs/marina-rivas-senior-es.md",
  "dayo-okafor": "fixtures/cvs/dayo-okafor-mid-en.md",
};

describe("hand-verified CV/job grounding fixtures", () => {
  it("contains three schema-valid, deterministically scored comparisons", () => {
    expect(Object.keys(cachedJobMatchFixtures)).toHaveLength(3);

    const expectedScores: Record<FictionalExampleId, number> = {
      "alex-kessler": 75,
      "marina-rivas": 71,
      "dayo-okafor": 86,
    };

    for (const [id, fixture] of Object.entries(cachedJobMatchFixtures) as [
      FictionalExampleId,
      (typeof cachedJobMatchFixtures)[FictionalExampleId],
    ][]) {
      expect(jobMatchExtractionSchema.safeParse(fixture.extraction).success).toBe(true);
      expect(scoreJobMatch(fixture.extraction).coverageScore).toBe(expectedScores[id]);
      expect(scoreJobMatch(fixture.extraction)).toEqual(scoreJobMatch(fixture.extraction));
    }
  });

  it("keeps every requirement quote verbatim in its job and every claimed match in its CV", () => {
    for (const [id, fixture] of Object.entries(cachedJobMatchFixtures) as [
      FictionalExampleId,
      (typeof cachedJobMatchFixtures)[FictionalExampleId],
    ][]) {
      const job = readFileSync(resolve(fixture.jobPath), "utf8");
      const cv = readFileSync(resolve(cvPaths[id]), "utf8");

      expect(validateRequirementQuotes(job, fixture.extraction).valid).toBe(true);
      for (const requirement of fixture.extraction.requirements) {
        for (const evidence of requirement.cvEvidence) {
          expect(cv, `${id}: ${evidence.quote}`).toContain(evidence.quote);
        }
      }
    }
  });

  it("uses not_demonstrated only as absence of supporting CV evidence", () => {
    for (const fixture of Object.values(cachedJobMatchFixtures)) {
      for (const requirement of fixture.extraction.requirements) {
        if (requirement.coverage === "not_demonstrated") {
          expect(requirement.cvEvidence).toEqual([]);
          expect(requirement.explanation).toMatch(/CV/i);
        }
      }
    }
  });
});
