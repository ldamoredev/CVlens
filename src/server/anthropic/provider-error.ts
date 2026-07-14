import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
} from "@anthropic-ai/sdk";

export type AnthropicRequestFailure =
  | "authentication"
  | "connection"
  | "provider"
  | "rate_limited"
  | "timeout";

export class AnthropicRequestError extends Error {
  readonly reason: AnthropicRequestFailure;

  constructor(reason: AnthropicRequestFailure) {
    super("The CV analysis provider request failed.");
    this.name = "AnthropicRequestError";
    this.reason = reason;
  }
}

export function classifyAnthropicError(error: unknown): AnthropicRequestFailure {
  if (
    error instanceof APIConnectionTimeoutError ||
    error instanceof APIUserAbortError ||
    (error instanceof Error && error.name === "AbortError")
  ) {
    return "timeout";
  }

  if (error instanceof RateLimitError || (error instanceof APIError && error.status === 429)) {
    return "rate_limited";
  }

  if (
    error instanceof AuthenticationError ||
    error instanceof PermissionDeniedError ||
    (error instanceof APIError && (error.status === 401 || error.status === 403))
  ) {
    return "authentication";
  }

  if (error instanceof APIConnectionError) return "connection";
  return "provider";
}
