import { describe, expect, it } from "vitest";

import {
  createGeneratedCvFixture,
  GENERATED_CV_SOURCE_FIXTURE,
} from "./contract.test-fixture";
import { generatedCvSchema, generationSessionStateSchema } from "./contract";

describe("generatedCvSchema", () => {
  function collectEvidence(value: unknown): Array<{ quote: string }> {
    if (Array.isArray(value)) return value.flatMap(collectEvidence);
    if (typeof value !== "object" || value === null) return [];
    const record = value as Record<string, unknown>;
    const ownEvidence = Array.isArray(record.evidence)
      ? record.evidence.filter(
          (item): item is { quote: string } =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).quote === "string",
        )
      : [];
    return [
      ...ownEvidence,
      ...Object.entries(record)
        .filter(([key]) => key !== "evidence")
        .flatMap(([, child]) => collectEvidence(child)),
    ];
  }

  it("accepts one strict source-backed CV document", () => {
    expect(generatedCvSchema.safeParse(createGeneratedCvFixture()).success).toBe(true);
  });

  it("rejects an entity that is not verbatim in its evidence", () => {
    const cv = createGeneratedCvFixture();
    cv.experience[0]!.organization = {
      text: "Invented Corp",
      evidence: [{ quote: "Acme Labs", location: "Experience" }],
    };

    const parsed = generatedCvSchema.safeParse(cv);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          path: ["experience", 0, "organization", "text"],
        }),
      ]));
    }
  });

  it("keeps every entity and rewritten claim traceable to the fictional source", () => {
    const generation = createGeneratedCvFixture();
    const parsed = generatedCvSchema.parse(generation);
    const evidence = collectEvidence(parsed);

    expect(evidence.length).toBeGreaterThan(0);
    for (const item of evidence) {
      expect(GENERATED_CV_SOURCE_FIXTURE).toContain(item.quote);
    }
  });

  it("rejects rewritten claims without verbatim source evidence", () => {
    const cv = createGeneratedCvFixture();
    cv.experience[0]!.bullets[0]!.evidence = [];

    expect(generatedCvSchema.safeParse(cv).success).toBe(false);
  });

  it("rejects scores and additional response fields", () => {
    const cv = { ...createGeneratedCvFixture(), score: 97 };
    expect(generatedCvSchema.safeParse(cv).success).toBe(false);
  });

  it("allows contact values only in the generated contact block", () => {
    const valid = createGeneratedCvFixture();
    expect(generatedCvSchema.safeParse(valid).success).toBe(true);

    const invalid = createGeneratedCvFixture();
    invalid.summary = [{
      text: "Contact alex@example.test",
      evidence: [{ quote: "alex@example.test", location: "Header" }],
    }];
    expect(generatedCvSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects an empty generated document", () => {
    const cv = createGeneratedCvFixture();
    cv.header = { name: null, headline: null, contact: [] };
    cv.experience = [];
    cv.skills = [];

    expect(generatedCvSchema.safeParse(cv).success).toBe(false);
  });

  it("validates the sequential quota and permits a repeated strategy", () => {
    expect(generationSessionStateSchema.safeParse({
      token: "opaque-generation-token-long-enough",
      count: 1,
      remaining: 2,
      usedStrategies: ["ats_focused"],
    }).success).toBe(true);
    expect(generationSessionStateSchema.safeParse({
      token: "opaque-generation-token-long-enough",
      count: 2,
      remaining: 1,
      usedStrategies: ["ats_focused", "ats_focused"],
    }).success).toBe(true);
  });
});
