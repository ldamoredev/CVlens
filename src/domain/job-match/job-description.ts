export const MIN_JOB_DESCRIPTION_CHARACTERS = 40;
export const MAX_JOB_DESCRIPTION_CHARACTERS = 6_000;

export type JobDescriptionValidationResult =
  | { ok: true; value: string | null }
  | { ok: false; reason: "invalid_length" | "invalid_type" };

export function validateOptionalJobDescription(
  input: unknown,
): JobDescriptionValidationResult {
  if (input === null || input === undefined) {
    return { ok: true, value: null };
  }

  if (typeof input !== "string") {
    return { ok: false, reason: "invalid_type" };
  }

  const value = input.trim();

  if (value.length === 0) {
    return { ok: true, value: null };
  }

  if (
    value.length < MIN_JOB_DESCRIPTION_CHARACTERS ||
    value.length > MAX_JOB_DESCRIPTION_CHARACTERS
  ) {
    return { ok: false, reason: "invalid_length" };
  }

  return { ok: true, value };
}
