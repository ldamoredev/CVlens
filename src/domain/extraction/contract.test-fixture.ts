import type { CriterionFinding, CvExtraction } from "./contract";

function finding(
  overrides: Partial<CriterionFinding> = {},
): CriterionFinding {
  return {
    outcome: "meets",
    explanation: "The CV provides clear supporting evidence.",
    evidence: [
      {
        quote: "Built payment flows for 30 enterprise clients",
        location: "Experience — Software Engineer",
      },
    ],
    notEvaluableReason: null,
    ...overrides,
  };
}

export function createValidExtractionFixture(): CvExtraction {
  return {
    schemaVersion: "1.0",
    document: {
      language: "en",
      languageEvidence: [
        {
          quote: "Professional Experience",
          location: "Section heading",
        },
      ],
      languageReason: null,
    },
    dimensions: {
      impact: {
        resultOrientedBullets: finding(),
        quantifiedAchievements: finding(),
        actionVerbOpenings: finding(),
      },
      clarity: {
        bulletLength: finding(),
        emptyJargon: finding(),
        passiveVoice: finding(),
        tenseConsistency: finding(),
      },
      atsStructure: {
        standardSections: finding(),
        reverseChronologicalOrder: finding(),
        parserSafeFormat: finding(),
        completeContactInformation: finding(),
        appropriateLength: finding(),
      },
      consistency: {
        unexplainedDateGaps: finding(),
        contradictoryDates: finding(),
        overlappingDates: finding(),
        dateFormatConsistency: finding(),
      },
      domainSignal: {
        experienceBackedSkills: finding(),
        unsupportedSkillList: finding(),
      },
    },
  };
}
