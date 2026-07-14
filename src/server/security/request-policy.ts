import { isIP } from "node:net";

import { MAX_MULTIPART_BYTES } from "../../domain/upload/policy";

export type AnalyzeRequestPolicyError =
  | "cross_site_request"
  | "invalid_content_length"
  | "invalid_content_type"
  | "missing_content_length"
  | "request_too_large";

export type AnalyzeRequestPolicy =
  | { valid: true; contentLength: number }
  | { valid: false; reason: AnalyzeRequestPolicyError };

const multipartContentTypePattern =
  /^multipart\/form-data\s*;(?=[^\r\n]*\bboundary=(?:"[^"]+"|[^;\s]+))[^\r\n]+$/i;

export function validateAnalyzeRequestHeaders(
  headers: Headers,
): AnalyzeRequestPolicy {
  const fetchSite = headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite === "cross-site") {
    return { valid: false, reason: "cross_site_request" };
  }

  const contentType = headers.get("content-type")?.trim() ?? "";
  if (!multipartContentTypePattern.test(contentType)) {
    return { valid: false, reason: "invalid_content_type" };
  }

  const rawContentLength = headers.get("content-length")?.trim();
  if (!rawContentLength) {
    return { valid: false, reason: "missing_content_length" };
  }

  if (!/^\d+$/.test(rawContentLength)) {
    return { valid: false, reason: "invalid_content_length" };
  }

  const contentLength = Number(rawContentLength);
  if (!Number.isSafeInteger(contentLength) || contentLength <= 0) {
    return { valid: false, reason: "invalid_content_length" };
  }

  if (contentLength > MAX_MULTIPART_BYTES) {
    return { valid: false, reason: "request_too_large" };
  }

  return { valid: true, contentLength };
}

function firstValidIp(value: string | null): string | null {
  if (!value) return null;

  for (const candidate of value.split(",")) {
    const normalized = candidate.trim();
    if (isIP(normalized) !== 0) return normalized;
  }

  return null;
}

export function resolveClientAddress(headers: Headers): string {
  return (
    firstValidIp(headers.get("x-forwarded-for")) ??
    firstValidIp(headers.get("x-real-ip")) ??
    "unknown"
  );
}
