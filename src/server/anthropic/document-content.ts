import type {
  DocumentBlockParam,
  ImageBlockParam,
} from "@anthropic-ai/sdk/resources/messages";

export interface AnthropicInputDocument {
  bytes: Buffer;
  mediaType: "application/pdf" | "image/jpeg";
}

export type CvContentBlock = DocumentBlockParam | ImageBlockParam;

export function createCvContentBlock(
  document: AnthropicInputDocument,
): CvContentBlock {
  const data = document.bytes.toString("base64");

  if (document.mediaType === "application/pdf") {
    return {
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data,
      },
      title: "Uploaded CV",
    };
  }

  return {
    type: "image",
    source: {
      type: "base64",
      media_type: "image/jpeg",
      data,
    },
  };
}
