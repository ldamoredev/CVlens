import { describe, expect, it, vi } from "vitest";

import { createGeneratedCvFixture } from "../../domain/generation/contract.test-fixture";
import {
  GenerationValidationError,
  generateWithSingleReinspection,
  parseGenerationOutput,
} from "./generation-reinspection";

describe("generation grounding and reinspection", () => {
  it("accepts one strict generated document", () => {
    const generation = createGeneratedCvFixture();
    expect(parseGenerationOutput(generation, "ats_focused")).toEqual(generation);
  });

  it("rejects a different strategy and an array of variants", () => {
    expect(() => parseGenerationOutput(createGeneratedCvFixture(), "concise"))
      .toThrow(GenerationValidationError);
    expect(() => parseGenerationOutput(
      [createGeneratedCvFixture(), createGeneratedCvFixture()],
      "ats_focused",
    )).toThrow(GenerationValidationError);
  });

  it("returns actionable safe codes for entity and collection failures", () => {
    const generation = createGeneratedCvFixture();
    generation.projects = [{
      name: {
        text: "Rewritten project name",
        evidence: [{ quote: "Original project name", location: "Projects" }],
      },
      context: null,
      dates: null,
      bullets: [{
        text: "Built the project.",
        evidence: [{ quote: "Built the project", location: "Projects" }],
      }],
    }];
    generation.additionalSections = [{
      title: "Other",
      items: Array.from({ length: 9 }, (_, index) => ({
        text: `Supported item ${index + 1}`,
        evidence: [{ quote: "Supported item", location: "Other" }],
      })),
    }];

    try {
      parseGenerationOutput(generation, "ats_focused");
      throw new Error("Expected generation validation to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(GenerationValidationError);
      if (!(error instanceof GenerationValidationError)) return;
      expect(error.issues).toEqual(expect.arrayContaining([
        {
          path: "projects.0.name.text",
          code: "entity_not_verbatim_in_evidence",
        },
        {
          path: "additionalSections.0.items",
          code: "too_many_items_max_8",
        },
      ]));
    }
  });

  it("performs exactly one independent reinspection without retaining raw output", async () => {
    const valid = createGeneratedCvFixture();
    const sensitiveRawValue = "broken private CV output";
    const reinspect = vi.fn().mockResolvedValue(valid);

    await expect(generateWithSingleReinspection(
      {
        initial: vi.fn().mockResolvedValue(sensitiveRawValue),
        reinspect,
      },
      "ats_focused",
      null,
    )).resolves.toEqual(valid);

    expect(reinspect).toHaveBeenCalledTimes(1);
    const prompt = String(reinspect.mock.calls[0]?.[0]);
    expect(prompt).toContain("exactly one new CV object");
    expect(prompt).toContain("never three variants");
    expect(prompt).toContain("invalid_json");
    expect(prompt).not.toContain(sensitiveRawValue);
  });

  it("stops after one failed reinspection", async () => {
    const reinspect = vi.fn().mockResolvedValue("still invalid");
    await expect(generateWithSingleReinspection(
      { initial: vi.fn().mockResolvedValue("invalid"), reinspect },
      "concise",
      null,
    )).rejects.toBeInstanceOf(GenerationValidationError);
    expect(reinspect).toHaveBeenCalledTimes(1);
  });
});
