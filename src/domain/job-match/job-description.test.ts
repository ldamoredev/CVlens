import { describe, expect, it } from "vitest";

import {
  MAX_JOB_DESCRIPTION_CHARACTERS,
  MIN_JOB_DESCRIPTION_CHARACTERS,
  validateOptionalJobDescription,
} from "./job-description";

describe("validateOptionalJobDescription", () => {
  it.each([undefined, null, "", "   \n "])(
    "accepts an omitted optional description",
    (input) => {
      expect(validateOptionalJobDescription(input)).toEqual({
        ok: true,
        value: null,
      });
    },
  );

  it("trims only the outer whitespace of a valid description", () => {
    const description = "  " + "A".repeat(MIN_JOB_DESCRIPTION_CHARACTERS) + "  ";

    expect(validateOptionalJobDescription(description)).toEqual({
      ok: true,
      value: "A".repeat(MIN_JOB_DESCRIPTION_CHARACTERS),
    });
  });

  it.each([
    "A".repeat(MIN_JOB_DESCRIPTION_CHARACTERS - 1),
    "A".repeat(MAX_JOB_DESCRIPTION_CHARACTERS + 1),
  ])("rejects out-of-bounds descriptions without returning them", (input) => {
    expect(validateOptionalJobDescription(input)).toEqual({
      ok: false,
      reason: "invalid_length",
    });
  });

  it("rejects non-string external input", () => {
    expect(validateOptionalJobDescription({ text: "untrusted" })).toEqual({
      ok: false,
      reason: "invalid_type",
    });
  });
});
