import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("root layout nonce hydration", () => {
  it("suppresses browser-hidden nonce mismatches on every inline script", () => {
    const source = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
    const inlineScripts = [...source.matchAll(/<script([\s\S]*?)\/>/g)];

    expect(inlineScripts).toHaveLength(2);
    for (const [, attributes] of inlineScripts) {
      expect(attributes).toContain("nonce={nonce}");
      expect(attributes).toContain("suppressHydrationWarning");
      expect(attributes).toContain("dangerouslySetInnerHTML");
    }
  });
});
