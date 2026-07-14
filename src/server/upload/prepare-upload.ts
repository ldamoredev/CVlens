import sharp from "sharp";

import {
  MAX_IMAGE_INPUT_PIXELS,
  MAX_IMAGE_LONG_EDGE,
  MAX_NORMALIZED_IMAGE_BYTES,
  type SupportedUploadMediaType,
  type UploadValidationErrorCode,
  validateUploadMetadata,
  validateUploadSignature,
} from "../../domain/upload/policy";

export interface UploadFileLike {
  arrayBuffer: () => Promise<ArrayBuffer>;
  size: number;
  type: string;
}

export interface PreparedUpload {
  bytes: Buffer;
  mediaType: "application/pdf" | "image/jpeg";
  originalBytes: Buffer;
  originalMediaType: SupportedUploadMediaType;
}

export class UploadPreparationError extends Error {
  readonly code: UploadValidationErrorCode;

  constructor(code: UploadValidationErrorCode) {
    super("The uploaded file did not satisfy the CVLens upload policy.");
    this.name = "UploadPreparationError";
    this.code = code;
  }
}

function fail(code: UploadValidationErrorCode): never {
  throw new UploadPreparationError(code);
}

export async function prepareUpload(
  file: UploadFileLike,
): Promise<PreparedUpload> {
  const metadata = validateUploadMetadata(file);
  if (!metadata.valid) fail(metadata.reason);

  const originalBytes = Buffer.from(await file.arrayBuffer());
  const signature = validateUploadSignature(originalBytes, metadata.mediaType);

  if (!signature.valid) {
    originalBytes.fill(0);
    fail(signature.reason);
  }

  if (signature.mediaType === "application/pdf") {
    return {
      bytes: originalBytes,
      mediaType: "application/pdf",
      originalBytes,
      originalMediaType: signature.mediaType,
    };
  }

  try {
    const bytes = await sharp(originalBytes, {
      failOn: "error",
      limitInputPixels: MAX_IMAGE_INPUT_PIXELS,
    })
      .rotate()
      .resize({
        width: MAX_IMAGE_LONG_EDGE,
        height: MAX_IMAGE_LONG_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();

    if (bytes.length > MAX_NORMALIZED_IMAGE_BYTES) {
      bytes.fill(0);
      originalBytes.fill(0);
      fail("file_too_large");
    }

    return {
      bytes,
      mediaType: "image/jpeg",
      originalBytes,
      originalMediaType: signature.mediaType,
    };
  } catch (error) {
    originalBytes.fill(0);
    if (error instanceof UploadPreparationError) throw error;
    fail("invalid_format");
  }
}

export function disposePreparedUpload(upload: PreparedUpload): void {
  upload.bytes.fill(0);
  if (upload.originalBytes !== upload.bytes) {
    upload.originalBytes.fill(0);
  }
}
