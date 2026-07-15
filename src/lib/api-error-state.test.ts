import { describe, expect, it } from "vitest";

import { apiErrorState } from "./api-error-state";

describe("analysis API error presentation", () => {
  it("maps actionable local failures to their dedicated states", () => {
    expect(apiErrorState({ error: { code: "file_too_large" } })).toBe("file_too_large");
    expect(apiErrorState({ error: { code: "insufficient" } })).toBe("insufficient");
    expect(apiErrorState({ error: { code: "invalid_format" } })).toBe("invalid_format");
    expect(apiErrorState({ error: { code: "invalid_request" } })).toBe("invalid_format");
    expect(apiErrorState({ error: { code: "provider_busy" } })).toBe("provider_busy");
    expect(apiErrorState({ error: { code: "provider_unavailable" } })).toBe(
      "provider_unavailable",
    );
    expect(apiErrorState({ error: { code: "rate_limited" } })).toBe("rate_limited");
    expect(apiErrorState({ error: { code: "timeout" } })).toBe("timeout");
  });

  it("keeps internal and unknown details behind the generic technical state", () => {
    expect(apiErrorState({ error: { code: "technical_error" } })).toBe("technical_error");
    expect(apiErrorState({ error: { code: "provider_secret_detail" } })).toBe(
      "technical_error",
    );
    expect(apiErrorState({ message: "provider detail" })).toBe("technical_error");
  });
});
