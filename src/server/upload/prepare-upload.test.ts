import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

import {
  MAX_IMAGE_LONG_EDGE,
  MAX_UPLOAD_BYTES,
} from "../../domain/upload/policy";
import {
  UploadPreparationError,
  disposePreparedUpload,
  prepareUpload,
  type UploadFileLike,
} from "./prepare-upload";

function fileLike(bytes: Buffer, type: string): UploadFileLike {
  return {
    type,
    size: bytes.length,
    arrayBuffer: async () =>
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
  };
}

describe("prepareUpload", () => {
  it("keeps a signature-verified PDF native for Anthropic", async () => {
    const pdf = Buffer.from("%PDF-1.7\nfictional fixture\n%%EOF");
    const upload = await prepareUpload(fileLike(pdf, "application/pdf"));

    expect(upload.mediaType).toBe("application/pdf");
    expect(upload.bytes).toBe(upload.originalBytes);
    expect(upload.bytes.equals(pdf)).toBe(true);

    disposePreparedUpload(upload);
    expect(upload.bytes.every((byte) => byte === 0)).toBe(true);
  });

  it("rotates, bounds, flattens, and converts images to JPEG", async () => {
    const png = await sharp({
      create: {
        width: 2_400,
        height: 1_200,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0.8 },
      },
    })
      .png()
      .toBuffer();
    const upload = await prepareUpload(fileLike(png, "image/png"));
    const metadata = await sharp(upload.bytes).metadata();

    expect(upload.originalMediaType).toBe("image/png");
    expect(upload.mediaType).toBe("image/jpeg");
    expect(Math.max(metadata.width ?? 0, metadata.height ?? 0)).toBe(
      MAX_IMAGE_LONG_EDGE,
    );
    expect(metadata.hasAlpha).toBe(false);

    disposePreparedUpload(upload);
    expect(upload.bytes.every((byte) => byte === 0)).toBe(true);
    expect(upload.originalBytes.every((byte) => byte === 0)).toBe(true);
  });

  it("rejects a spoofed MIME type before decoding", async () => {
    const pdf = Buffer.from("%PDF-1.7\n%%EOF");

    await expect(prepareUpload(fileLike(pdf, "image/png"))).rejects.toMatchObject({
      code: "invalid_format",
    });
  });

  it("rejects oversized metadata without reading the file", async () => {
    const arrayBuffer = vi.fn<() => Promise<ArrayBuffer>>();

    await expect(
      prepareUpload({
        type: "application/pdf",
        size: MAX_UPLOAD_BYTES + 1,
        arrayBuffer,
      }),
    ).rejects.toBeInstanceOf(UploadPreparationError);
    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it("rejects corrupt image bytes with a valid-looking signature", async () => {
    const corruptPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);

    await expect(
      prepareUpload(fileLike(corruptPng, "image/png")),
    ).rejects.toMatchObject({ code: "invalid_format" });
  });
});
