# CVLens upload and analysis pipeline

Owner: Phase 4  
Runtime: Next.js Node server

## Request boundary

`POST /api/analyze` accepts one multipart field named `file`. Supported inputs are PDF,
JPEG, and PNG up to 8 MiB. CVLens validates the declared MIME type, byte length, and file
signature before any provider call. Unsupported, empty, oversized, spoofed, and corrupt
inputs receive a bounded public error; provider details and document content are never
returned or logged.

The byte limit is a code invariant shared by client and server, not an environment
setting. The multipart request limit adds only a small allowance for field headers.

## Normalization and memory

- PDFs remain native and are sent as an Anthropic `document` block.
- JPEG and PNG inputs are auto-rotated, flattened onto white, resized inside a 1568 px
  long edge, and encoded as bounded JPEG before becoming an `image` block.
- Image decoding rejects inputs above 40 megapixels; normalized output is capped at
  5 MiB.
- The original upload buffer and normalized buffer are overwritten in `finally` cleanup
  paths on both success and failure. Files are never written to disk or persisted.

JavaScript strings created by SDK/base64 serialization cannot be overwritten in place;
they remain request-local and become eligible for garbage collection after the request.

## Extraction and scoring

The server-only adapter uses the pinned `ANTHROPIC_MODEL` and Anthropic structured output
derived from the strict Zod contract. The document block appears before the instruction.
Responses pass through Zod and the single controlled reinspection policy before entering
the pure TypeScript rubric. The model never supplies or influences a numeric score.

The API returns the validated extraction and deterministic rubric with `Cache-Control:
no-store`. The client validates the extraction again and independently recomputes the
rubric before presenting it.

## Bundled examples

The three bundled CVs are fictional. Their extraction fixtures were generated once,
checked against each source line by line, corrected where model review missed a layout or
date issue, and committed as typed data. Selecting an example uses only that local fixture
and `scoreExtraction`; it never calls `/api/analyze` or Anthropic.

Regression tests assert that every cached evidence quote is verbatim text from its
fictional source and that all fixtures satisfy the same production schema.

## Privacy and phase boundary

Contact values are forbidden throughout evidence, locations, explanations, and reasons.
Both the prompt and Zod refinements enforce that rule. Protected attributes are ignored.
Phase 6 still owns per-IP rate limiting, final timeout/error policy, security headers,
privacy copy hardening, metrics, and the health endpoint.
