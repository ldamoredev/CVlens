import { describe, expect, it } from "vitest";

import { createCvContentBlock } from "./document-content";

describe("createCvContentBlock", () => {
  it("creates a native base64 PDF block before prompt text", () => {
    const bytes = Buffer.from("%PDF-1.7\nfixture");

    expect(
      createCvContentBlock({ bytes, mediaType: "application/pdf" }),
    ).toEqual({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: bytes.toString("base64"),
      },
      title: "Uploaded CV",
    });
  });

  it("creates a normalized JPEG image block", () => {
    const bytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

    expect(createCvContentBlock({ bytes, mediaType: "image/jpeg" })).toEqual({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: bytes.toString("base64"),
      },
    });
  });
});
