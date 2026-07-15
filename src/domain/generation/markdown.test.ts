import { describe, expect, it } from "vitest";

import { createGeneratedCvFixture } from "./contract.test-fixture";
import { generatedCvToMarkdown } from "./markdown";

describe("generatedCvToMarkdown", () => {
  it("renders the single generated document without audit metadata", () => {
    const markdown = generatedCvToMarkdown(createGeneratedCvFixture());

    expect(markdown).toContain("# Alex Rivera");
    expect(markdown).toContain("## Experience");
    expect(markdown).toContain("### Frontend Developer — Acme Labs");
    expect(markdown).toContain("- Improved checkout completion by 18%.");
    expect(markdown).toContain("## Skills\n\nTypeScript");
    expect(markdown).not.toContain("CV fixture");
    expect(markdown).not.toContain("evidence");
    expect(markdown.endsWith("\n")).toBe(true);
  });
});
