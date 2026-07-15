import { describe, expect, it } from "vitest";

import {
  EXTRACTION_ANALYSIS_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
  JOB_MATCH_SYSTEM_PROMPT,
  buildJobMatchAnalysisPrompt,
  buildJobMatchReinspectionPrompt,
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

  it("keeps job matching in its own evidence-only structured contract", () => {
    const jobDescription = "Strong TypeScript experience is required.";
    const prompt = buildJobMatchAnalysisPrompt(jobDescription);

    expect(JOB_MATCH_SYSTEM_PROMPT).toContain("job-match object");
    expect(JOB_MATCH_SYSTEM_PROMPT).toContain("Never calculate");
    expect(prompt).toContain(JSON.stringify(jobDescription));
    expect(prompt).toContain("comparison only");
    expect(prompt).not.toContain("resultOrientedBullets");

    const reinspection = buildJobMatchReinspectionPrompt(jobDescription, [
      { path: "requirements.0.requirementEvidence.quote", code: "not_verbatim_job_evidence" },
    ]);
    expect(reinspection).toContain("job-match extraction only");
    expect(reinspection).toContain("not_verbatim_job_evidence");
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
