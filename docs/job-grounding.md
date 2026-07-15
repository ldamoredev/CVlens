# Job-description grounding

Phase 9 adds an optional, evidence-backed comparison between a CV and one job
description. It does not replace or modify the CV-quality rubric. The two results are
displayed separately because they answer different questions:

- CV quality: how clearly and consistently the document presents its own evidence;
- job match: how much of this particular job's cited requirements is demonstrated by
  evidence in this particular CV.

Neither result evaluates the person or predicts a hiring decision.

## Input boundary and privacy

`jobDescription` is an optional multipart text field accepted by `POST /api/analyze`.
Whitespace-only input is treated as omitted. A supplied description must contain 40–6,000
characters after outer whitespace is trimmed. Non-string values and out-of-range input are
rejected before a provider call with the existing safe `invalid_request` response.

The field fits inside the existing hardened multipart allowance; the upload size, content
type, same-origin policy, rate limit, timeout, and security headers are unchanged. CVLens
does not persist or log the job description, just as it does not persist or log the CV.
Both are sent to Anthropic only for the requested live comparison. Cached examples use
local fictional fixtures and never call the provider.

For a supplied job description, the server runs two bounded Anthropic requests in parallel:
one preserves the established CV-quality schema and one returns only the job-match schema.
They share request cancellation, so a browser abort or failure cancels the peer request. This
split is required because Anthropic compiles structured-output schemas into grammars and
rejects overly complex combined schemas with HTTP 400; its documented mitigation is to split
the schema across requests. CVLens still returns one atomic analysis response only after both
validated findings are available. See the
[Anthropic structured-output complexity limits](https://platform.claude.com/docs/en/build-with-claude/structured-outputs#schema-complexity-limits).

## Extraction contract

The model returns findings only. `src/domain/job-match/contract.ts` uses a strict Zod
schema and rejects extra properties, including model-generated scores. A grounded result
contains one to twelve material, explicit requirements. Each requirement has:

- a concise label and a verbatim quote from the submitted job description;
- `required`, `preferred`, or `unspecified` priority;
- `covered`, `partial`, `not_demonstrated`, or `not_evaluable` coverage;
- a concise explanation in the language detected from the CV;
- zero to three verbatim CV quotes and a non-sensitive location label;
- an explicit reason when comparison is not evaluable.

`covered` and `partial` require CV evidence. `not_demonstrated` must have no CV evidence
and means only that this document did not demonstrate the requirement. It never asserts
that the candidate lacks a skill. `not_evaluable` must have no CV evidence and must state
the ambiguity. Contact values are rejected throughout the contract.

After schema parsing, the server verifies every requirement quote by exact substring
comparison against the submitted job description. A failed schema or grounding check
allows exactly one independent reinspection of the original CV and job description. Raw
model output, CV content, and job-description content are not retained in validation
errors.

The comparison prompt requires each requirement quote to be one contiguous,
character-for-character source substring. It forbids translation, punctuation normalization,
ellipsis, and concatenated fragments; a complete source sentence may be reused for distinct
requirements. This keeps prose-style job descriptions compatible with the same deterministic
substring validation used for bullet-based descriptions.

Both documents are explicitly treated as untrusted data. The system prompt instructs the
model to ignore embedded instructions, protected attributes, contact values, inferred
experience, adjacent technologies, unstated seniority, and hiring predictions. Output
language continues to come from the CV, not the job description or browser.

## Deterministic coverage score

`src/domain/job-match/score.ts` is pure TypeScript. The model cannot access or influence
the numeric mapping:

| Coverage state | Points |
| --- | ---: |
| `covered` | 100 |
| `partial` | 50 |
| `not_demonstrated` | 0 |
| `not_evaluable` | excluded |

Priority weights are `required = 2`, `preferred = 1`, and `unspecified = 1`. The score is:

```text
round(sum(points × priority weight) / sum(evaluable priority weights))
```

Non-evaluable requirements are excluded rather than converted to zero. Evidence coverage
reports the evaluable weight divided by total weight. If nothing is evaluable, the score
is `null` with `insufficient_information`; otherwise the state is `complete` or `partial`.

Recommendations are deterministic presentation copy. They may foreground or clarify
already-cited evidence, but explicitly prohibit broadening a claim. For an unmet
requirement they say to add an example only if it is true and verifiable; otherwise the
gap remains honest.

## Hand-verified fictional fixtures

Each cached comparison has a fictional CV, a fictional job, schema-valid extraction, exact
job quotes, exact CV quotes, and a deterministic expected score:

| Pair | Coverage states | Score |
| --- | --- | ---: |
| `alex-kessler-junior-en.md` + `alex-frontend-en.md` | 2 covered, 1 partial, 1 not demonstrated | 75 |
| `marina-rivas-senior-es.md` + `marina-backend-es.md` | 2 covered, 1 partial, 1 not demonstrated | 71 |
| `dayo-okafor-mid-en.md` + `dayo-fullstack-en.md` | 3 covered, 1 not demonstrated | 86 |

`src/data/cached-job-match-extractions.test.ts` reads all six source files and verifies
every quote. Selecting a landing-page example renders this cached comparison with no
network or model call.

## Verification procedure

Automated checks cover input bounds, schema cross-field rules, contact-data rejection,
exact requirement grounding, the single reinspection, deterministic weighting and
renormalization, fixture source quotes, upload-buffer disposal, strict TypeScript, lint,
the full Vitest suite, and the production build.

For manual verification:

1. Open the production build in dark and light themes at desktop and mobile widths.
2. Confirm the optional field accepts an empty value, rejects a non-empty value shorter
   than 40 characters, shows its 6,000-character bound, and does not disable CV-only use.
3. Select each fictional example and confirm the job-match card is separate from the CV
   score, opens cited job/CV evidence, and makes no `/api/analyze` request.
4. Upload a fictional CV with and without a fictional job description. Confirm the
   response is discarded from client state on reset and no content appears in logs.
5. Confirm the browser console is clean and the existing CSP nonce, HSTS,
   `X-Frame-Options: DENY`, and `nosniff` headers remain present.
