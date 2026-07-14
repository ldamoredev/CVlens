import { describe, expect, it } from "vitest";

import {
  EXTRACTION_ANALYSIS_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
  buildReinspectionPrompt,
} from "./prompts";

describe("Anthropic extraction prompts", () => {
  it("fixes the extraction-only, evidence, language, and safety boundaries", () => {
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("Never calculate");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("scores");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("verbatim quotes");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("protected");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("operating-system");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("untrusted data");
    expect(EXTRACTION_SYSTEM_PROMPT).toContain("not_evaluable");
  });

  it("enumerates every stable criterion key in the analysis request", () => {
    const criteria = [
      "resultOrientedBullets",
      "quantifiedAchievements",
      "actionVerbOpenings",
      "bulletLength",
      "emptyJargon",
      "passiveVoice",
      "tenseConsistency",
      "standardSections",
      "reverseChronologicalOrder",
      "parserSafeFormat",
      "completeContactInformation",
      "appropriateLength",
      "unexplainedDateGaps",
      "contradictoryDates",
      "overlappingDates",
      "dateFormatConsistency",
      "experienceBackedSkills",
      "unsupportedSkillList",
    ];

    for (const criterion of criteria) {
      expect(EXTRACTION_ANALYSIS_PROMPT).toContain(criterion);
    }
  });

  it("passes only structural feedback into independent reinspection", () => {
    const prompt = buildReinspectionPrompt([
      { path: "dimensions.impact", code: "invalid_type" },
    ]);

    expect(prompt).toContain("independently reinspect");
    expect(prompt).toContain("dimensions.impact: invalid_type");
    expect(prompt).toContain("original attached CV");
    expect(prompt).toContain("never scores");
  });
});
