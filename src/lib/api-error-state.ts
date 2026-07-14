import type { AppState } from "./presentation-state";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function apiErrorState(value: unknown): AppState {
  if (!isRecord(value) || !isRecord(value.error)) return "technical_error";

  const code = value.error.code;
  if (code === "invalid_request") return "invalid_format";
  if (
    code === "file_too_large" ||
    code === "insufficient" ||
    code === "invalid_format" ||
    code === "rate_limited"
  ) {
    return code;
  }

  return "technical_error";
}
