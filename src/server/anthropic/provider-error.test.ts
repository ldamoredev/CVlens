import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
} from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";

import { classifyAnthropicError } from "./provider-error";

describe("Anthropic provider error classification", () => {
  it("classifies timeouts and aborted requests without exposing messages", () => {
    expect(classifyAnthropicError(new APIConnectionTimeoutError())).toBe("timeout");
    expect(classifyAnthropicError(new APIUserAbortError())).toBe("timeout");
  });

  it("classifies quotas, authentication, bad requests, connections, and unknown failures", () => {
    expect(classifyAnthropicError(APIError.generate(429, {}, "private", new Headers()))).toBe(
      "rate_limited",
    );
    expect(classifyAnthropicError(APIError.generate(401, {}, "private", new Headers()))).toBe(
      "authentication",
    );
    expect(classifyAnthropicError(APIError.generate(400, {}, "private", new Headers()))).toBe(
      "request",
    );
    expect(classifyAnthropicError(new APIConnectionError({ message: "private" }))).toBe(
      "connection",
    );
    expect(classifyAnthropicError(new Error("private"))).toBe("provider");
  });
});
