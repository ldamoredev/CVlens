import {
  MAX_UPLOAD_BYTES,
  validateUploadMetadata,
} from "../domain/upload/policy";

export { MAX_UPLOAD_BYTES };

export type PreviewState =
  | "dragging"
  | "file_too_large"
  | "idle"
  | "insufficient"
  | "invalid_format"
  | "loading"
  | "partial"
  | "rate_limited"
  | "selected"
  | "success"
  | "technical_error";

export type UploadValidation =
  | { valid: true }
  | { valid: false; reason: "file_too_large" | "invalid_format" };

const previewStates = new Set<PreviewState>([
  "dragging",
  "file_too_large",
  "idle",
  "insufficient",
  "invalid_format",
  "loading",
  "partial",
  "rate_limited",
  "selected",
  "success",
  "technical_error",
]);

export function normalizePreviewState(value: string | undefined): PreviewState {
  return value && previewStates.has(value as PreviewState) ? (value as PreviewState) : "idle";
}

export function validateUpload(file: Pick<File, "size" | "type">): UploadValidation {
  const result = validateUploadMetadata(file);
  if (result.valid) return { valid: true };
  return {
    valid: false,
    reason: result.reason === "file_too_large" ? "file_too_large" : "invalid_format",
  };
}

export function formatFileSize(bytes: number, language: "en" | "es"): string {
  const megabytes = bytes / (1024 * 1024);
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(megabytes) + " MB";
}
