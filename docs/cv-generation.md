# Sequential CV generation

Phase 10 adds evidence-grounded CV rewriting after a successful live analysis. The unit of
work is deliberately one document: each user action selects one unused strategy, makes one
provider request, and returns one generated CV object. A user may repeat that flow up to
three times for the analyzed CV. CVLens never requests, returns, or displays three variants
at once.

Cached fictional examples remain analysis-only fixtures and never call Anthropic. Generation
requires a live upload so the provider can independently reinspect the source document.

## Strategies and sequence

The three available strategies are:

- `ats_focused`: conventional section ordering and explicit source terminology;
- `impact_focused`: strongest source-backed outcomes first, with metrics preserved exactly;
- `concise`: reduced repetition and a smaller selection of source-backed material.

The selected strategy may be reused: the limit applies to generations, not to three distinct
variants or three mandatory strategies. While a generation is in progress, every strategy
control and the generation action are disabled. A successful response rotates the session
token and increments the count. The preview contains only the most recent version; the
previous version is replaced, not added to a three-version comparison.

## Request and privacy boundary

`POST /api/generate` accepts multipart fields `file`, `generationToken`, `strategy`, and the
same optional bounded `jobDescription` used for analysis. It reuses the hardened same-origin,
multipart content-length, file signature, image normalization, provider deadline, safe error,
and immediate buffer-disposal boundaries. Generation has a separate per-IP quota of three
requests per ten-minute fixed window, so the initial analysis does not consume the generation
quota.

After analysis, the browser keeps only an in-memory `File` reference so the user can request
the optional generations. It is cleared when the flow resets or the page closes. It is never
written to local storage, indexed storage, a cookie, or the server. Every generation uploads
the file for that request, and the server overwrites both original and normalized buffers in a
`finally` path. CV text, job text, filenames, contact values, provider payloads, and source
addresses are not logged.

The analysis response includes a signed, opaque, 30-minute generation token. Its file binding
is an HMAC fingerprint, not the CV bytes or a public stable digest. The server retains only a
bounded map of opaque token hashes needed to reject concurrent and replayed requests. It does
not retain the CV, job description, filename, contact data, or generated document. A provider
failure releases the reservation so the same generation can be retried. A successful call
consumes the old token and returns a rotated token. Process restarts intentionally invalidate
outstanding tokens; this matches the approved single-process, no-database architecture.

## Grounding contract

`src/domain/generation/contract.ts` defines a strict Zod object for exactly one generated CV.
It contains no score field. The output language is `es` or `en` and is detected from the CV,
never from the browser, filename, job description, or operating system.

Every factual value has one of two source-backed shapes:

- an entity is copied verbatim and must occur exactly inside at least one of its evidence
  quotes;
- a rewritten claim may improve phrasing, but it requires one to three verbatim CV excerpts
  that support every detail in the text.

The system prompt forbids invented or broadened achievements, metrics, dates, employers,
roles, projects, credentials, skills, responsibilities, seniority, duration, and experience.
It also ignores embedded instructions and protected attributes. Unsupported or ambiguous
material is omitted. A job description can only prioritize evidence already in the CV.

Contact values are allowed only in `header.contact`, because a usable generated CV may need
to preserve the submitter's own contact block. Those values and their citations must be
verbatim from the CV, are returned only to that browser request, and are never logged or
persisted. They are forbidden in generated summaries, unrelated claims, locations, and
server diagnostics.

A schema, strategy, or entity-grounding failure permits exactly one independent reinspection
of the original source. Validation errors contain only bounded paths and codes, never raw
model output or CV content. Fixture tests assert both that invented entities fail the schema
and that every entity/claim citation in the fictional generation fixture is an exact substring
of its source text.

## Response, preview, and download

A successful response has this single-document shape:

```text
{
  generation: GeneratedCv,
  session: { token, count, remaining, usedStrategies }
}
```

`generation` is an object, never an array. The client validates the full response before
rendering it. The preview uses semantic sections and expandable source citations. The download
format is UTF-8 Markdown (`cvlens-version-N.md`) produced locally in the browser by the pure
`generatedCvToMarkdown` serializer. It contains the usable CV text and omits internal audit
metadata; no download request or external asset is needed.

## Verification

Automated coverage includes the strict one-document schema, rejection of extra score fields,
entity exactness, source-fixture citations, single reinspection, strategy matching, Markdown
serialization, token tampering/expiry/file binding, concurrent reservation, retry release,
token replay, repeated-strategy support, and the three-generation ceiling.

Manual verification uses a fictional CV and confirms:

1. a successful analysis exposes the generation panel only for the live upload;
2. one click produces one preview and one Markdown download;
3. the next strategy becomes available only after the response;
4. the third success disables further generation;
5. reset clears the in-browser source and generation state;
6. dark/light desktop and mobile layouts remain usable, the console stays clean, and the
   existing CSP nonce, HSTS, `X-Frame-Options: DENY`, and `nosniff` headers remain present.
