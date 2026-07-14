export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"] as const;

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
  if (!allowedMimeTypes.includes(file.type as (typeof allowedMimeTypes)[number])) {
    return { valid: false, reason: "invalid_format" };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { valid: false, reason: "file_too_large" };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number, language: "en" | "es"): string {
  const megabytes = bytes / (1024 * 1024);
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(megabytes) + " MB";
}
