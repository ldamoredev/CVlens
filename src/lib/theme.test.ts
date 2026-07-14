import { describe, expect, it } from "vitest";

import { resolveThemePreference } from "./theme";

describe("theme preference resolution", () => {
  it("honors an explicit saved preference", () => {
    expect(resolveThemePreference("light", false)).toBe("light");
    expect(resolveThemePreference("dark", true)).toBe("dark");
  });

  it("uses the system preference when storage is absent or invalid", () => {
    expect(resolveThemePreference(null, true)).toBe("light");
    expect(resolveThemePreference("sepia", false)).toBe("dark");
  });
});
