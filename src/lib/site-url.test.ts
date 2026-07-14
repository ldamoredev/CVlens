import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site-url";

describe("site URL", () => {
  it("defaults to the local origin", () => {
    expect(resolveSiteUrl(undefined).href).toBe("http://localhost:3000/");
  });

  it("normalizes a configured public URL to its origin", () => {
    expect(resolveSiteUrl(" https://cvlens.up.railway.app/path?q=1 ").href).toBe(
      "https://cvlens.up.railway.app/",
    );
  });

  it("rejects non-web schemes and embedded credentials", () => {
    expect(() => resolveSiteUrl("javascript:alert(1)")).toThrow(
      "must use http or https",
    );
    expect(() => resolveSiteUrl("https://user:pass@example.com")).toThrow(
      "must not include credentials",
    );
  });
});
