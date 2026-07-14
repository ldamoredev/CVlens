import { describe, expect, it } from "vitest";

import { apiErrorState } from "./api-error-state";

describe("analysis API error presentation", () => {
  it("maps actionable local failures to their dedicated states", () => {
    expect(apiErrorState({ error: { code: "file_too_large" } })).toBe("file_too_large");
    expect(apiErrorState({ error: { code: "insufficient" } })).toBe("insufficient");
    expect(apiErrorState({ error: { code: "invalid_format" } })).toBe("invalid_format");
    expect(apiErrorState({ error: { code: "invalid_request" } })).toBe("invalid_format");
    expect(apiErrorState({ error: { code: "rate_limited" } })).toBe("rate_limited");
  });

  it("keeps provider details behind the generic technical state", () => {
    for (const code of [
      "provider_busy",
      "provider_unavailable",
      "technical_error",
      "timeout",
    ]) {
      expect(apiErrorState({ error: { code } })).toBe("technical_error");
    }
    expect(apiErrorState({ message: "provider detail" })).toBe("technical_error");
  });
});
