export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_MULTIPART_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;
export const MAX_IMAGE_LONG_EDGE = 1_568;
export const MAX_IMAGE_INPUT_PIXELS = 40_000_000;
export const MAX_NORMALIZED_IMAGE_BYTES = 5 * 1024 * 1024;

export const supportedUploadMediaTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export type SupportedUploadMediaType =
  (typeof supportedUploadMediaTypes)[number];

export type UploadValidationErrorCode =
  | "empty_file"
  | "file_too_large"
  | "invalid_format";

export type UploadValidation =
  | { valid: true; mediaType: SupportedUploadMediaType }
  | { valid: false; reason: UploadValidationErrorCode };

interface UploadMetadata {
  size: number;
  type: string;
}

function isSupportedMediaType(value: string): value is SupportedUploadMediaType {
  return supportedUploadMediaTypes.includes(
    value as SupportedUploadMediaType,
  );
}

export function validateUploadMetadata(
  upload: UploadMetadata,
): UploadValidation {
  if (!isSupportedMediaType(upload.type)) {
    return { valid: false, reason: "invalid_format" };
  }

  if (!Number.isSafeInteger(upload.size) || upload.size <= 0) {
    return { valid: false, reason: "empty_file" };
  }

  if (upload.size > MAX_UPLOAD_BYTES) {
    return { valid: false, reason: "file_too_large" };
  }

  return { valid: true, mediaType: upload.type };
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((byte, index) => bytes[index] === byte);
}

export function detectUploadMediaType(
  bytes: Uint8Array,
): SupportedUploadMediaType | null {
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return "application/pdf";
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }

  return null;
}

export function validateUploadSignature(
  bytes: Uint8Array,
  declaredMediaType: SupportedUploadMediaType,
): UploadValidation {
  const detectedMediaType = detectUploadMediaType(bytes);

  if (detectedMediaType !== declaredMediaType) {
    return { valid: false, reason: "invalid_format" };
  }

  return { valid: true, mediaType: detectedMediaType };
}
