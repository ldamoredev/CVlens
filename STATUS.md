# CVLens — Project status

Last updated: 2026-07-14

`STATUS.md` is the source of truth for phase ownership and handoffs. Work only on the
phase marked `IN_PROGRESS`; do not begin the next phase automatically.

## Active phase

**No phase is active. Phase 8 maintenance hotfix — Turbopack favicon compatibility is
`COMPLETED` (completed 2026-07-14).**

The SEO release gate is met and the updated app is publicly deployed on Railway at
<https://cvlens.up.railway.app>. Phase 10 remains `NOT_STARTED` and must not begin
automatically.

The Phase 7 `CVLENS_SITE_URL` follow-up is resolved: the variable now points at
<https://cvlens.up.railway.app>, and the production `og:url` and `og:image` tags resolve to
that domain.

## Roadmap

| Phase | Name | Status | Priority / gate |
| --- | --- | --- | --- |
| 0 | Bootstrap | COMPLETED | MVP day 1; completed 2026-07-13 |
| 1 | Visual foundation + examples | COMPLETED | Light-theme amendment completed 2026-07-13 |
| 2 | Anthropic extraction contract | COMPLETED | MVP day 1; completed 2026-07-13 |
| 3 | Deterministic rubric engine | COMPLETED | MVP day 1; completed 2026-07-13 |
| 4 | Real upload + example caching | COMPLETED | MVP day 2; completed 2026-07-13 |
| 5 | Results, evidence, and recommendations | COMPLETED | MVP day 2; completed 2026-07-14 |
| 6 | Hardening | COMPLETED | MVP day 2; completed 2026-07-14 |
| 7 | Tests, fixtures, and launch | COMPLETED | MVP day 2; completed 2026-07-14 |
| 8 | SEO review and improvement | COMPLETED | Launch polish + Turbopack favicon hotfix; completed 2026-07-14 |
| 9 | Grounding against job description | COMPLETED | Completed 2026-07-14 |
| 10 | Generate three CV versions | NOT_STARTED | Next eligible; not active |

## Phase acceptance criteria

### Phase 0 — Bootstrap

- Git repository on `main`.
- Next.js App Router project with strict TypeScript and Tailwind.
- Lint, typecheck, build, and Vitest commands are defined and pass.
- `AGENTS.md`, `CLAUDE.md`, `STATUS.md`, `README.md`, and `.env.example` exist.
- Railway is documented as a single Node process with no database.

### Phase 1 — Visual foundation + examples

- Mobile-first landing, upload zone, three fictional CV examples, result skeleton,
  all specified UI states, and the dotted-to-solid verification motif using mock data.

### Phase 2 — Anthropic extraction contract

- Zod schema for evidence-backed findings only, document-language detection, prompts,
  one controlled reinspection retry, and `docs/ai-contract.md`.

### Phase 3 — Deterministic rubric engine

- Pure findings-to-scores domain module, explicit weights and rounding, complete/partial/
  insufficient states, exhaustive tests, and `docs/rubric.md`.

### Phase 4 — Real upload + example caching

- Validated PDF/JPG/PNG pipeline, bounded images and memory, Anthropic-to-Zod-to-rubric
  integration, and three hand-verified cached example fixtures with no live demo calls.

### Phase 5 — Results, evidence, and recommendations

- Overall score and five expandable subscores with evidence and actionable guidance in
  the CV language, presented cleanly for portfolio capture.

### Phase 6 — Hardening

- Per-IP in-memory rate limiting, timeouts, safe error mapping, security headers,
  privacy notice, non-sensitive metrics, `/health`, and Railway-ready deployment.

### Phase 7 — Tests, fixtures, and launch

- Schema and rubric coverage, at least five regression fixtures (including Spanish),
  public deploy, OG image, sub-15-second demo path, portfolio copy, and LinkedIn draft.

### Phase 8 — SEO review and improvement

- Favicon and app icons (`favicon.ico`, `icon`, `apple-icon`) via the App Router metadata
  file conventions; verify they serve in production (the deploy currently returns 404 for
  `/favicon.ico`).
- Complete document metadata: canonical URL, `robots` directives, author/keywords where
  appropriate, and correct `lang`; confirm the OpenGraph/Twitter tags resolve against the
  production domain (`CVLENS_SITE_URL`, already set to <https://cvlens.up.railway.app>).
- `robots.txt` and `sitemap.xml` via `src/app/robots.ts` and `src/app/sitemap.ts`.
- Optional JSON-LD structured data (e.g. `SoftwareApplication`/`WebApplication`) that stays
  compatible with the existing CSP nonce path: no inline script without the request nonce and
  no external requests.
- Semantic-HTML, heading-hierarchy, landmark, and image-alt review for crawlability and
  accessibility, in both the dark and light themes.
- A documented SEO audit (e.g. Lighthouse) with before/after results, recorded in
  `docs/seo.md`.
- No analytics, tracking, external fonts/scripts, or other privacy/CSP regressions. Preserve
  all product invariants and the hardened request boundary.

### Phase 9 — Grounding against job description

- Optional bounded job-description input; cited requirement extraction and evidence-
  backed coverage states; deterministic coverage score; match recommendations that
  never invent experience; at least three hand-verified CV/job fixtures.

### Phase 10 — Generate three CV versions

- Three strategy-based variants, previews and documented download format, using only
  traceable source-CV content; entity-level anti-hallucination regression tests.

## Non-negotiable decisions

- The model extracts structured findings and never emits scores.
- TypeScript calculates all dimension and overall scores deterministically.
- Every finding has textual CV evidence or is explicitly not evaluable.
- Output language follows the CV content.
- Uploaded files are never persisted or logged and are discarded after analysis.
- Protected attributes are ignored and never discussed.
- Bundled examples are fictional, fixture-backed, deterministic, and make no live call.
- Runtime target: Railway, one Node service, no database, in-memory rate limiting.

## Deferred ideas — do not implement during phases 0–10

- Compare versions of the same CV over time.
- Cover-letter analysis.
- CVs longer than two pages and long-form academic curricula vitae.
- Export the analysis report as a shareable PDF.

## Approved UI/UX reference

The current Claude Design light-theme revision supplied on 2026-07-13 is preserved
unchanged under `docs/design-reference/`. Its HTML and runtime have matching SHA-256
hashes with the source files, and usage notes are recorded in that directory's `README.md`.

Implement it incrementally: Phase 1 owns the visual foundation and mock states, Phase 5
owns the complete evidence-backed result, and Phase 6 owns production hardening states.
The reference does not activate a phase or override the roadmap and product invariants.

## Phase 0 work log

### Files changed

- Initialized Git on branch `main`.
- Added coordination docs: `AGENTS.md`, `CLAUDE.md`, `STATUS.md`, and `README.md`.
- Added `.env.example` and `.gitignore`.
- Added the Next.js bootstrap under `src/app`, including only a technical placeholder.
- Added TypeScript, Next.js, Tailwind/PostCSS, ESLint, and Vitest configuration.
- Added `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`.
- Added `src/bootstrap.test.ts` as the Phase 0 test harness smoke test.

### Commands and validation

- `pnpm install` — passed; reproducible lockfile created and allowed dependency build
  scripts (`sharp`, `unrs-resolver`) completed.
- `pnpm peers check` — passed; no peer dependency issues.
- `pnpm typecheck` — passed with TypeScript strict mode.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 1 file, 1 test.
- `pnpm build` — passed; `/` and `/_not-found` generated successfully.
- Production smoke check — `pnpm start --hostname 127.0.0.1 --port 3100` returned
  HTTP 200 and rendered `CVLens` plus the expected Phase 0 placeholder; server stopped.
- Repository whitespace scan — passed with no trailing whitespace findings.

### Decisions

- Package manager: pnpm with exact dependency versions and a committed lockfile.
- Supported toolchain versions are pinned rather than using incompatible latest peers:
  Next.js 16.2.10, React 19.2.7, TypeScript 5.9.3, and ESLint 9.39.5.
- Runtime: one Railway Node service, no database or persistent volume. Build uses
  `pnpm build`; runtime uses `pnpm start`.
- `ANTHROPIC_API_KEY` remains server-only. The model default is intentionally deferred
  to Phase 2, when the extraction contract is designed.
- No upload, model integration, scoring, examples, product UI, or deployment was added;
  those remain owned by later phases.

### Known debt / blockers

- No blockers.
- The page is intentionally a minimal technical placeholder. Phase 1 owns the visual
  identity, fictional example CVs, upload surface, states, and mock result skeleton.
- Phase 2 must select and document the default Haiku-tier `ANTHROPIC_MODEL` based on the
  extraction contract; `.env.example` keeps it configurable and blank for now.

## Phase 0 handoff — fulfilled

Phase 0 was completed and its handoff was fulfilled by the Phase 1 implementation below.

## Phase 1 work log

### Files changed

- Replaced the technical placeholder with the responsive CVLens product shell under
  `src/app` and `src/components/cvlens-app.tsx`.
- Implemented local Space Grotesk and JetBrains Mono assets, the approved color tokens,
  dotted-to-solid motif, focus states, reduced motion, and 390/768/1440 layouts.
- Added upload selection/drag UI with client-side presentation validation for PDF/JPG/PNG
  and an 8 MB limit. Files are not read, persisted, logged, or sent in this phase.
- Added all required states: idle, dragging, selected, loading, success, partial,
  insufficient information, invalid format, file too large, technical error, and rate
  limited. They can be reviewed with `/?state=<state_name>`.
- Added three detailed fictional CV sources under `fixtures/cvs/` and corresponding mock
  presentation results under `src/data/fictional-examples.ts`.
- Added complete/partial mock score layouts, five expandable dimension rows, explicit
  non-evaluable treatment, cited fictional evidence, and ES/EN presentation variants.
- Added pure state/file-validation and fictional-fixture tests.

### Commands and validation

- `pnpm typecheck` — passed.
- `pnpm lint` — passed with zero warnings; the immutable generated Design Canvas runtime
  is excluded while application and test code remain linted.
- `pnpm test` — passed: 3 files, 11 tests.
- `pnpm build` — passed with the App Router root route generated successfully.
- Browser desktop check at 1440 px — passed for idle and complete-result layouts.
- Browser tablet/mobile check at 390 px — passed with no horizontal overflow; all sampled
  interactive targets are at least 44 px.
- Manual interaction — example selection, language switch, loading transition, partial
  result, accordion expansion, and explicit non-evaluable evidence passed.
- Visual-state audit — all 11 preview states render; no browser console warnings/errors.

### Decisions

- Phase 1 scores are explicitly labeled mock and live only in presentation fixtures. They
  are not model output and must be replaced by the deterministic Phase 3 rubric result.
- Selecting a bundled example runs a short client-only progress demo and never calls a
  model. Selecting a local file validates only its metadata; the file is not read or sent.
- Local-file analysis ends in the honest `insufficient` placeholder until Phase 4 wires
  the real upload pipeline, avoiding fabricated findings about a user document.
- Example output language follows each fictional CV. The ES/EN toggle controls only the
  idle/error interface, never overrides an analyzed example's document language.
- The approved reference is implemented incrementally: Phase 5 still owns production
  result data/details, and Phase 6 owns real rate limiting and hardened failures.

### Known debt / blockers

- No blockers.
- The Markdown CV sources intentionally preserve problematic content/layout cues; Phase 4
  must turn them into reviewed PDF/image demo assets and cache verified extractions.
- Query-string state previews are a Phase 1 QA aid. Phase 6 should decide whether to keep
  them outside production or gate them behind development configuration.

## Phase 1 handoff

Phase 1 is complete and validated. The next agent should activate only Phase 2, define the
Zod findings contract and prompts, and preserve the existing presentation fixtures without
adding model-generated scores. Do not begin Phase 3 during that handoff.

## Phase 1 light-theme amendment

### Files changed

- Replaced `docs/design-reference/cvlens-reference.dc.html` with the approved light-theme
  revision (`f8b82a0e…fa08c6`); `support.js` was already byte-identical and remains intact.
- Added semantic light tokens and component overrides in `src/app/globals.css` using the
  reference's WCAG-AA text colors and light surfaces.
- Added an accessible sun/moon toggle to the application header.
- Added a pre-hydration theme initializer and pure preference resolver in
  `src/lib/theme.ts`, with unit coverage.

### Commands and validation

- `pnpm typecheck` — passed.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 4 files, 13 tests.
- `pnpm build` — passed.
- Production browser check — dark → light → dark toggle passed; accessible action labels
  updated correctly and the chosen theme survived a full reload.
- Light-theme idle and partial-result layouts passed at 1440, 390, and 320 px with no
  horizontal overflow; cards resolved to white on `#F4F7FB` and retained readable ink.
- Browser console audit — no warnings or errors.

### Decisions

- With no saved choice, the initial theme follows `prefers-color-scheme`; an explicit
  choice is stored under `cvlens-theme` and takes precedence on later visits.
- Theme initialization runs before hydration to avoid a dark/light flash. Theme selection
  remains independent from UI language and detected CV language.
- Light mode uses darker AA-safe text accents (`#2E7ACB`, `#1F9D63`, `#B5610E`,
  `#C4362F`) while preserving the dotted-to-solid motif.

### Known debt / blockers

- No blockers.
- Phase 6 security headers must account for the small inline pre-hydration theme script,
  preferably with the deployment's CSP nonce strategy.

## Phase 2 work log

### Files changed

- Added Zod 4 as a pinned runtime dependency and defined the strict versioned extraction
  contract under `src/domain/extraction/contract.ts`.
- Added all 18 stable rubric criteria across the five dimensions. Every evaluated finding
  requires one to three verbatim quotes; `not_evaluable` requires no evidence and an
  explicit reason. Unknown fields, including any model-emitted score, are rejected.
- Added evidence-backed `es` / `en` document-language detection plus `undetermined` for
  unreadable or genuinely ambiguous documents, avoiding a silent language assumption.
- Added the extraction-only system and analysis prompts under `src/server/anthropic/`,
  including prompt-injection handling, protected-attribute exclusions, language rules,
  and the complete criterion list.
- Added a provider-neutral parser and one controlled independent reinspection after JSON
  or Zod failure. Raw output and CV contents are excluded from retry feedback; provider
  and transport failures are not retried by this mechanism.
- Pinned the low-cost default to `claude-haiku-4-5-20251001`, bounded extraction output to
  6,000 tokens, and kept `ANTHROPIC_MODEL` configurable.
- Added schema, prompt, configuration, privacy, and retry tests plus the field-by-field
  contract documentation in `docs/ai-contract.md`.
- Updated `.env.example` and `README.md` for the completed contract and phase boundary.

### Commands and validation

- `pnpm add zod@4.3.6` — passed; dependency and lockfile updated.
- `pnpm typecheck` — passed with strict TypeScript.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 8 files, 30 tests.
- `pnpm build` — passed; production bundle compiled and both app routes generated.
- Production smoke check — `pnpm start --hostname 127.0.0.1 --port 3102` returned HTTP
  200, rendered CVLens and the visible no-storage privacy notice, then was stopped.
- `git diff --check` — passed.

### Decisions

- Contract version `1.0` has a fixed object key for every criterion rather than a free-form
  finding array. This forces complete extraction and gives Phase 3 stable deterministic
  inputs without letting the model choose rubric categories or weights.
- The four non-numeric outcomes are `meets`, `needs_improvement`, `mixed`, and
  `not_evaluable`. Their numeric meaning, weights, partial-state behavior, and rounding are
  deliberately deferred to Phase 3.
- Zod remains the runtime authority even when Phase 4 connects Anthropic structured
  output: provider-constrained JSON covers shape, while CVLens cross-field refinements
  enforce evidence/reason invariants.
- The retry is evidence reinspection, not response repair. There is exactly one second
  attempt, and only after invalid JSON or schema mismatch.
- No Anthropic SDK, API route, upload parsing, file buffers, live calls, scoring, or UI
  changes were introduced in this phase.

### Known debt / blockers

- No blockers.
- Phase 3 must document and exhaustively test the deterministic mapping from these
  categorical findings to complete/partial/insufficient scores.
- Phase 4 must add the server-only Anthropic SDK adapter, structured-output conversion,
  multimodal document blocks, reviewed fixtures, and buffer cleanup. The pinned default
  model must be changed only if those fixtures demonstrate a quality need.

## Phase 3 work log

### Files changed

- Added the pure deterministic engine under `src/domain/rubric/rubric.ts`; its only import
  is a type-only reference to the Phase 2 extraction contract.
- Defined fixed overall weights: impact 30%, clarity 20%, ATS structure 25%, consistency
  15%, and domain signal 10%.
- Defined fixed local weights for all 18 criteria and the categorical mapping `meets=100`,
  `mixed=50`, `needs_improvement=0`, and `not_evaluable=null`.
- Added auditable criterion results containing outcome, fixed points, local weight, and
  weighted contribution.
- Implemented dimension and overall coverage, complete/partial/insufficient states, a 50%
  publication threshold for the overall number, and one final round-half-up operation.
- Added exhaustive tests covering configuration totals, every outcome, all 18 individual
  not-evaluable paths, legitimate zero, partial renormalization, insufficient information,
  the exact coverage threshold, rounding, audit contributions, determinism, immutability,
  and independence from evidence wording/count.
- Added `docs/rubric.md` with field weights, rationale, formulas, examples, state rules,
  rounding, invariants, and phase boundaries; updated `README.md`.

### Commands and validation

- `pnpm typecheck` — passed with strict TypeScript.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 9 files, 61 tests.
- `pnpm build` — passed; production bundle compiled and both app routes generated.
- Pure-domain import audit — passed; the rubric contains no Anthropic, Next.js, React,
  environment, clock, randomness, or network dependency.
- Isolated manual execution — compiled the rubric to `/tmp` and verified a complete fixture
  returns overall `100`, coverage `100%`, and five complete dimensions.
- Partial manual execution — a not-evaluable 35%-weight impact criterion returned impact
  score `100` at `65%` coverage and overall score `100` at `89.5%` coverage, proving that
  unavailable evidence is excluded rather than silently scored as zero.
- `git diff --check` — passed.
- `.env` ignore check — passed; the configured API key file remains ignored and was never
  read, printed, or used during this local-only phase.

### Decisions

- Overall scoring uses effective global criterion weights, not rounded dimension scores.
  This avoids double rounding and prevents a sparse partial dimension from receiving its
  entire dimension weight.
- `not_evaluable` is excluded from numerator and denominator. A dimension with some
  available criteria is renormalized and marked partial; one with none has a `null` score.
- The overall score is withheld below 50% global coverage. At or above 50% it is published
  as partial; only 100% coverage is complete.
- Scores use non-negative round-half-up (`floor(x + 0.5)`) exactly once after each full
  weighted calculation. Global coverage is displayed to one decimal place.
- Text, language, evidence count, invocation time, and environment never affect scoring.
  Only validated categorical outcomes and rubric version do.

### Known debt / blockers

- No blockers.
- Phase 4 must connect validated Anthropic extraction to `scoreExtraction`, create and
  hand-review cached example findings, and confirm the current model against those fixtures.
- The Phase 1 UI still displays explicit mock scores. Real rubric results should replace
  them only when the upload/example pipeline is integrated; presentation completion remains
  owned by Phase 5.
- Any future weight, outcome, threshold, or rounding change requires a documented rubric
  version bump and regression review.

## Phase 3 handoff — fulfilled

Phase 3 was completed and its handoff was fulfilled by the Phase 4 implementation below.

## Phase 4 work log

### Files changed

- Added shared PDF/JPEG/PNG metadata and signature validation under `src/domain/upload`,
  with an 8 MiB file cap, bounded multipart allowance, and exhaustive boundary tests.
- Added the server upload preparation pipeline under `src/server/upload`: PDFs remain
  native; images are orientation-normalized, flattened, resized inside 1568 px, and
  re-encoded as bounded JPEG. Original and normalized buffers are zeroed in `finally`.
- Added the server-only Anthropic adapter with native document/image blocks, structured
  output derived from Zod, a 180-second SDK timeout, disabled SDK logging/retries, and the
  existing single controlled schema reinspection.
- Added `POST /api/analyze`, which validates input, runs extraction, passes only validated
  findings to the deterministic rubric, returns `no-store`, and exposes only bounded error
  codes without logging provider details or CV contents.
- Connected the upload UI to the real endpoint. The browser validates the returned
  extraction again and recomputes the deterministic score before presentation; uploaded
  file references are released after each request.
- Replaced Phase 1 mock presentation data with three schema-valid, hand-reviewed cached
  extraction fixtures. Every citation is regression-checked against its fictional source,
  and example selection remains local with no API/model call.
- Added a generic extraction-plus-rubric presentation mapper as a Phase 4 bridge. Phase 5
  still owns the complete evidence and recommendations experience.
- Hardened the extraction contract after a live fictional review exposed a contact-value
  quote: emails, phone-like values, and profile/web URLs are now rejected from evidence,
  locations, explanations, and non-evaluable reasons as well as forbidden by the prompt.
- Added exact runtime dependencies `@anthropic-ai/sdk@0.111.0`, `sharp@0.35.3`, and
  `server-only@0.0.1`, plus `docs/upload-pipeline.md` and updated boundary documentation.

### Commands and validation

- `pnpm typecheck` — passed with strict TypeScript.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 15 files, 88 tests.
- `pnpm build` — passed; `/api/analyze` is dynamic and the root production route compiled.
- `git diff --check` — passed.
- Production smoke check — `pnpm start --hostname 127.0.0.1 --port 3104` returned HTTP
  200 for `/`, then was stopped.
- Manual production analysis — a rendered fictional English CV image completed through
  the real endpoint in 21.9 seconds, detected `en`, returned deterministic partial score
  79 at 95% coverage, and returned no contact evidence.
- Live fixture review — all three fictional CVs completed against the configured Anthropic
  key; extractions were compared with their source text, then cached and manually corrected
  where layout/ATS and date-consistency findings required stricter review.
- Invalid-upload check — a Markdown fixture returned `invalid_format` before a provider
  call. Unit coverage also verifies empty, oversized, corrupt, MIME-spoofed, and excessive-
  pixel inputs as well as buffer cleanup on success and failure.
- Cached-example regression — all three fixtures pass Zod, score deterministically, and
  every evidence quote is an exact substring of the corresponding fictional CV source.

### Decisions

- The 8 MiB upload limit is a shared code invariant rather than an environment variable,
  so client and server cannot drift through deployment configuration.
- PDFs are sent natively to Anthropic; CVLens does not locally extract or persist their
  text. Images are normalized to the provider's practical 1568 px vision boundary.
- Provider-constrained JSON does not replace Zod. CVLens validates all cross-field and
  privacy invariants before the extraction can enter `scoreExtraction`.
- The server returns the rubric for an auditable API boundary, while the client recomputes
  it from the validated extraction instead of trusting a transport-supplied score.
- Bundled examples store reviewed categorical extractions, not model scores. Their numbers
  are calculated from the same rubric at runtime and never consume the configured API key.
- Contact completeness remains explicitly `not_evaluable` whenever it cannot be supported
  with privacy-safe category labels; contact values are never accepted as evidence.

### Known debt / blockers

- No product blocker.
- The in-app browser harness could not initialize because its installed runtime attempts
  to redefine a protected `process` property. Production HTTP/live-flow checks passed, but
  Phase 5 should repeat the visual interaction and mobile-overflow audit when that harness
  is available.
- Phase 6 still owns streaming/body hardening for requests without a trustworthy
  `Content-Length`, per-IP rate limiting, final timeout/error policy, security headers,
  non-sensitive metrics, the privacy notice, and `/health`.
- Native PDF page-count enforcement is intentionally absent; long-form CV support remains
  deferred, and the rubric marks length not evaluable when document evidence is unclear.
- Base64 strings created inside the SDK cannot be overwritten in JavaScript. They remain
  request-local and become garbage-collectable after the request; mutable upload buffers
  are explicitly zeroed.

## Phase 4 handoff — fulfilled

Phase 4 was completed and its handoff was fulfilled by the Phase 5 implementation below.

## Phase 5 work log

### Files changed

- Replaced the Phase 4 representative-finding bridge in
  `src/data/analysis-presentation.ts` with a complete presentation model for all 18 stable
  rubric criteria across the five dimensions.
- Added localized criterion names, outcome labels, dimension and global coverage, fixed
  categorical points, local weights, every validated evidence quote and location, and
  explicit non-evaluable reasons.
- Added deterministic ES/EN editing guidance for every criterion. Recommendations are
  selected from criterion/outcome templates and explicitly avoid invented results,
  metrics, dates, activities, role types, and skills; no second model call is made.
- Rebuilt the result UI in `src/components/cvlens-app.tsx` and `src/app/globals.css` with a
  sticky score/provenance summary, five expandable audit cards, nested finding cards,
  multiple citations, calculation context, and dotted uncertainty treatment.
- Corrected live-upload presentation metadata so labels follow the detected CV language,
  not the interface language that happened to be active before analysis.
- Added a privacy-safe contact-category label to the fictional Alex fixture and reviewed
  extraction, enabling a genuine complete demo state without exposing contact values.
- Expanded presentation and example regression tests and added
  `docs/results-presentation.md`; updated `README.md` for the completed phase boundary.

### Commands and validation

- `pnpm typecheck` — passed with strict TypeScript.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 15 files, 91 tests.
- `pnpm build` — passed; the root page and dynamic `/api/analyze` route compiled.
- `git diff --check` — passed.
- Production smoke check — `pnpm start --hostname 127.0.0.1 --port 3105` served the final
  build; `/?state=success` contained `Analysis complete`, `100%`, and
  `reviewed fixture · no API`, then the server was stopped.
- Cached Spanish flow — Marina Rivas rendered score 82 with 82.3% evidence coverage;
  expanding ATS showed all five criteria, five recommendations, and one explicit
  non-evaluable reason with no fabricated citation.
- English result audit — rendered all five dimensions and the three Impact findings with
  criterion weights, fixed points, verbatim evidence, locations, and safe guidance.
- Responsive browser audit — 1440, 768, and 390 px passed with no horizontal overflow;
  sampled interactive targets remained at least 44 px at tablet and mobile widths.
- Dark/light visual review — both themes preserved hierarchy, readable evidence blocks,
  source provenance, and the dotted-to-solid motif. Browser console had no warnings or
  errors.

### Decisions

- The result presents every criterion in rubric order rather than selecting one finding
  per dimension. This makes positive, negative, mixed, and unavailable evidence auditable.
- Recommendation text is deterministic presentation logic, not model output. The cited
  evidence remains adjacent to each action so the user can distinguish source facts from
  editing guidance.
- A criterion displays its fixed points and local dimension weight, while the existing
  rubric remains the only numeric authority. No UI code recalculates or changes weights.
- `not_evaluable` displays its validated reason, an empty/dotted evidence treatment, and
  “excluded from calculation”; it is never rendered as zero.
- Only one dimension expands at a time to keep long 18-criterion reports scannable and
  suitable for desktop portfolio capture without turning the layout into a table.
- The cached complete demo uses only the verbatim safe label
  `Contact categories: email · GitHub`; actual contact values remain rejected everywhere.

### Known debt / blockers

- No blockers.
- Recommendations are intentionally bounded document-editing templates. Job-specific
  grounding and more contextual match guidance remain owned by the job-description grounding
  phase (renumbered to Phase 9 after SEO was inserted as Phase 8).
- Phase 6 still owns rate limiting, request/body hardening, final timeout and provider error
  policy, security headers, the production privacy notice, non-sensitive metrics,
  `/health`, and Railway readiness.
- Exporting or sharing the report remains a deferred idea and was not introduced.

## Phase 5 handoff — fulfilled

Phase 5 was completed and its handoff was fulfilled by the Phase 6 implementation below.

## Phase 6 work log

### Files changed

- Added a bounded fixed-window limiter under `src/server/security/`: three attempts per
  source address per ten minutes, process-salted address hashes, a 10,000-bucket cap,
  `Retry-After`, and aggregate rate headers. Raw addresses are never stored or exposed.
- Hardened `POST /api/analyze` before body parsing: same-origin Fetch Metadata checks,
  mandatory bounded multipart `Content-Length`, explicit malformed-body handling,
  no-store responses, and stable public error codes.
- Reduced Anthropic's attempt timeout to 60 seconds, added a shared 75-second deadline
  across the initial extraction and optional reinspection, propagated request aborts,
  kept SDK retries disabled, and classified provider failures without returning provider
  response bodies or messages. The route maximum is 90 seconds.
- Added in-memory aggregate outcome/duration metrics and `GET /health`. The endpoint
  exposes no CV content, filename, MIME type, contact detail, address, key, or model value.
- Added a per-request nonce CSP in `src/proxy.ts`, nonce propagation to the theme script,
  MIME/referrer/frame/capability/cross-origin headers, production HSTS, and a webpack
  production build required by the current App Router nonce path.
- Disabled `?state=` QA previews in production unless the server-only
  `CVLENS_ENABLE_PREVIEW_STATES=true` flag is explicitly set.
- Replaced the ambiguous storage claim with accurate ES/EN disclosure that CVLens sends
  uploaded CVs to Anthropic and deletes its temporary copy after processing.
- Added `railway.json` with Railpack build/start commands, one replica, `/health`, and a
  bounded restart-on-failure policy. No Railway project was created or deployed.
- Added `docs/hardening.md`, updated `.env.example` and `README.md`, and added focused
  coverage for request policy, quota windows/memory bounds, error classification/client
  mapping, metrics, CSP, preview gating, and provider timing constants.

### Commands and validation

- `pnpm typecheck` — passed with strict TypeScript. An intermediate run caught the new
  shared `AppState` type before export; the type was centralized and the final run passed.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 22 files, 108 tests.
- `pnpm build` — passed with Next.js 16.2.10 using webpack; `/`, `/_not-found`,
  `/api/analyze`, `/health`, and Proxy compiled as dynamic production routes.
- `git diff --check` — passed.
- `railway.json` JSON parse — passed; the installed Railway CLI help was checked against
  the committed config-as-code workflow without linking or mutating a project.
- Production header check — `/` returned the nonce CSP, `nosniff`, no-referrer, frame
  denial, capability restrictions, same-origin policies, HSTS, and no-store rendering.
- Production preview/privacy check — `/?state=rate_limited` rendered the idle flow when
  the QA flag was unset, and the page named Anthropic plus CVLens's temporary-copy policy.
- Request/error check — a Markdown upload was rejected as `invalid_format`; JSON requests
  were rejected as `invalid_request`; the fourth attempt from one test address returned
  `429 rate_limited` with `Retry-After: 600`. Every response was `no-store`.
- Metrics check — `/health` reported exactly the five test requests as three invalid
  requests, one invalid upload, and one rate-limited request, with no sensitive fields.
- Live fictional CV check — a generated `/tmp` image containing only fictional Spanish
  CV data was sent once through the configured Anthropic path. It returned HTTP 200,
  detected `es`, produced the deterministic rubric result, completed inside the
  15–30-second bucket, and incremented only the aggregate success counter. Temporary test
  files were deleted and the API key was neither read nor printed.
- Browser interaction — cached Spanish selection reached the 82-point partial result,
  theme switching worked under CSP, and the browser console had no warnings or errors.
  At 390 and 1440 px there was no horizontal overflow and visible controls remained at
  least 44 px high.

### Decisions

- The MVP quota is intentionally local to one long-lived Node process. Address keys are
  opaque and ephemeral; a restart resets quota state rather than introducing a database.
- Railway stays at one replica so the local quota is coherent. Multi-replica deployment
  requires a later documented decision and a shared limiter.
- Missing or unbounded request lengths are rejected rather than buffered optimistically.
  This is stricter than generic HTTP uploads and is deliberate for the public CV endpoint.
- Provider quota, authentication, transport, timeout, and unknown failures have distinct
  internal categories but only safe CVLens codes cross the public boundary.
- Metrics are public-health aggregates, not analytics. No dimensions that could identify
  a document or user are collected.
- `style-src 'unsafe-inline'` remains narrowly necessary for bounded React meter widths;
  scripts use a nonce and `strict-dynamic` without production `unsafe-eval`.
- The Railway file is readiness configuration only. Creating infrastructure and exposing
  a public URL would cross into Phase 7 and was not done.

### Known debt / blockers

- No Phase 6 blocker.
- The in-memory limiter resets on process restart and depends on Railway's trusted
  forwarding headers. Horizontal scaling requires a shared rate-limit store and a revised
  privacy/architecture decision.
- CSP inline style removal would require replacing dynamic meter width attributes with a
  finite class/token system; it is not necessary for the current script threat boundary.
- Phase 7 still owns at least five launch regression fixtures, the public Railway deploy,
  OG image, sub-15-second demo path, portfolio copy, and LinkedIn draft.

## Phase 6 handoff — fulfilled

Phase 6 was completed and its handoff was fulfilled by the Phase 7 implementation below.

## Phase 7 work log

### Files changed

- Added the launch regression corpus in `src/data/regression-fixtures.ts` and
  `src/data/regression-fixtures.test.ts`: five fictional, schema-valid fixtures, each paired
  with the fictional source CV that backs its verbatim quotes. Reuses the three cached demo
  extractions and adds two regression-only fixtures.
- Added two fictional source CVs: `fixtures/cvs/lucia-fernandez-senior-es.md` (a second
  Spanish CV, full coverage) and `fixtures/cvs/noor-hassan-sparse-en.md` (a low-quality
  scan whose body is illegible).
- Added the OG image at `src/app/opengraph-image.tsx` (1200×630 PNG via `next/og`, brand
  tokens from the dark theme) and `src/app/twitter-image.tsx` reusing it.
- Added OpenGraph/Twitter metadata and `metadataBase` in `src/app/layout.tsx`, driven by a
  new `CVLENS_SITE_URL` environment variable (documented in `.env.example` and `README.md`).
- Added `docs/launch.md`: the regression corpus table, sub-15-second demo path, portfolio
  copy (ES/EN), a LinkedIn draft (ES/EN), and the Railway deploy runbook. Updated `README.md`
  to reflect the active phase and link the launch document.

### Commands and validation

- `pnpm typecheck` — passed with strict TypeScript.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 23 files, 126 tests (was 108). The new corpus adds 18 tests covering
  the complete, partial, and insufficient-information states across two Spanish and three
  English fixtures, with every evidence quote verified verbatim against its source CV.
- `pnpm build` — passed; `/`, `/api/analyze`, `/health`, `/opengraph-image`, and
  `/twitter-image` compiled. Proxy middleware compiled.
- Local production smoke — `/opengraph-image` returned a 1200×630 PNG; OG/Twitter meta tags
  render with absolute URLs; `/health` returned safe aggregate metrics.
- Manual browser check — the cached demo path (select fictional example → full audited
  result) rendered Marina Rivas at overall 82/100, 82.3% coverage, cited evidence, and the
  `reviewed fixture · no API` provenance badge, with no console warnings or errors.

### Deterministic regression scores

| Fixture | Language | State | Overall | Coverage |
| --- | --- | --- | --- | --- |
| `alex-kessler` | EN | complete | 71 | 100% |
| `marina-rivas` | ES | partial | 82 | 82.3% |
| `dayo-okafor` | EN | partial | 79 | 95% |
| `lucia-fernandez` | ES | complete | 98 | 100% |
| `noor-hassan` | EN | insufficient_information | — | 13.8% |

### Railway deployment

- Created Railway project `CVLens` (id `d239b036-ba9e-44ce-bc6a-974779260ba9`) and service
  `cvlens-web` (id `3a19680b-fd03-44d0-a131-91a3b7bd3473`), one replica, no database.
- Service variables set: `ANTHROPIC_API_KEY` (server-only), `ANTHROPIC_MODEL`
  (`claude-haiku-4-5-20251001`), `CVLENS_ENABLE_PREVIEW_STATES=false`, and `CVLENS_SITE_URL`.
- Deployed from the local working tree via Railpack (`railway.json`: `pnpm build` /
  `pnpm start`, health check `/health`). Node 22.23.1 and pnpm 11.12.0 with a frozen
  lockfile.
- Public domain: <https://cvlens.up.railway.app>.
- Post-deploy verification against the public domain: `/health` returned `status: ok` with
  only aggregate metrics; two live analyses of a fictional CV image returned HTTP 200 with a
  real Anthropic extraction plus the deterministic rubric result (both in the 15–30-second
  bucket, incrementing only the aggregate success counter); `/opengraph-image` returned a
  1200×630 PNG; the home response carried the nonce CSP, HSTS, frame denial, `nosniff`, and
  no-referrer headers.

### Decisions

- The regression corpus is separate from the three bundled UI examples. It reuses the cached
  extractions and adds two regression-only fixtures so the complete-in-Spanish and
  insufficient-information paths are pinned without changing the three-example landing UI.
- The sub-15-second demo path is the cached example flow (zero API latency), not live
  analysis. Live analysis of a real document remains in the ~15–30-second range and is
  documented as such in `docs/launch.md`.
- The deploy uses the Railway MCP `deploy` (local tarball upload) rather than a
  GitHub-connected trigger, so no push was required. `.env` and build artifacts are
  git-ignored and excluded from the tarball; the API key lives only as a service variable.
- Portfolio copy, the LinkedIn draft, and recommendation text remain deterministic,
  document-editing material; no product invariant (probabilistic extraction, deterministic
  scoring, no stored uploads, fixtures make no live call) was changed.

### Known debt / blockers

- No product blocker; the app is publicly live and a live analysis succeeds end to end.
- `CVLENS_SITE_URL` was initially left at the generated domain; it has since been updated to
  the active public domain `https://cvlens.up.railway.app`, and production `og:url` /
  `og:image` now resolve there. Resolved 2026-07-14. Verifying and completing SEO metadata is
  now Phase 8 scope.
- Railway variable changes only take effect on a deployment created after the change. A
  variable set while a build is already in flight requires a fresh redeploy to be picked up.
- The Phase 7 deploy was made from the local working tree; those changes are not yet
  committed to Git. Commit and push were intentionally left to the maintainer.
- Multi-replica scaling still requires a shared rate-limit store and a revised
  privacy/architecture decision (carried from Phase 6).

## Phase 7 handoff — fulfilled

Phase 7 is complete and the MVP is publicly deployed and functional at
<https://cvlens.up.railway.app>. Activate only Phase 8 next (SEO review and improvement);
job-description grounding is now Phase 9. Preserve the extraction contract, deterministic
rubric, cached example path, hardened request boundary, one-replica/no-database
architecture, safe metrics, CSP nonce path, and privacy disclosure. Any SEO structured-data
script must carry the request nonce, and no analytics, tracking, or external assets may be
introduced.

## Phase 8 work log

### Files changed

- Added App Router metadata-file icons: a multiresolution `src/app/favicon.ico`, 512 px
  `src/app/icon.png`, and 180 px `src/app/apple-icon.png`; added
  `scripts/generate-app-icons.mjs` so all local assets are reproducible from brand tokens.
- Extended `src/app/layout.tsx` with canonical, robots, author/publisher, keyword, and
  category metadata while preserving the Phase 7 OpenGraph/Twitter configuration and
  production `metadataBase`.
- Added nonce-bearing `WebApplication` JSON-LD. The script uses the same request nonce as
  the theme initializer and makes no external request.
- Added `src/app/robots.ts` and `src/app/sitemap.ts`, backed by a shared validated origin
  resolver in `src/lib/site-url.ts` and focused tests for URL validation and route output.
- Improved semantic structure in `src/components/cvlens-app.tsx`: visible `h1` headings in
  loading/result states, `h2` example and dimension sections, preserved `h3` findings,
  labeled regions, and synchronized the HTML `lang` with the ES/EN interface/CV language.
- Raised the dark/light low-emphasis ink tokens to remove the Lighthouse contrast failures
  without changing the brand hierarchy or theme architecture.
- Added `docs/seo.md` with the production Lighthouse baseline/result, HTTP checks, semantic
  review, CSP verification, and remaining audit note; updated `README.md`.

### Commands and validation

- `pnpm typecheck` — passed with TypeScript strict mode.
- `pnpm lint` — passed with zero warnings.
- `pnpm test` — passed: 25 files, 131 tests.
- `pnpm build` — passed with Next.js 16.2.10/webpack; `/`, `/api/analyze`, `/health`, both
  social images, both PNG app icons, `/robots.txt`, and `/sitemap.xml` compiled. The
  metadata-file favicon is served separately by the App Router convention.
- `node scripts/generate-app-icons.mjs` — passed; `file` identified a three-size
  16/32/48 px ICO, a 512×512 RGB PNG, and a 180×180 RGB PNG.
- Local production smoke — `/favicon.ico`, `/icon.png`, `/apple-icon.png`, `/robots.txt`,
  and `/sitemap.xml` all returned HTTP 200 with their expected MIME types; the home included
  canonical/robots/author/keyword metadata, icon links, and nonce-bearing JSON-LD.
- Lighthouse 13.4.0 public before/after — performance 78→99, accessibility 96→100,
  Best Practices 92→96, SEO 100→100. The favicon console error went 1→0, contrast failures
  11→0, and the canonical/robots audits changed from not-applicable to passing. Performance
  is a lab snapshot and is not treated as a deterministic product guarantee.
- Railway CLI preflight — authenticated workspace confirmed; CLI updated from 5.12.1 to
  5.26.1 after the older version could not scope deployment-history reads by project.
- Railway deploy — deployment `5172302e-4194-4894-b48e-c9ee46c60675` reached terminal
  `SUCCESS`; image digest `sha256:c8998d6afd8734677a02a95c949c221c1b76a7e65af640a9d1c8a70897f4e658`.
- Public endpoint check — favicon, app icon, Apple icon, robots, sitemap, OpenGraph image,
  and Twitter image all returned HTTP 200. Canonical, author, OG/Twitter, JSON-LD, robots,
  and sitemap URLs resolve to `https://cvlens.up.railway.app`.
- Production nonce/header check — all 14 rendered script tags carried the request nonce
  declared by CSP. The home retained HSTS, `X-Frame-Options: DENY`, `nosniff`, no external
  origins, and the existing self-only CSP boundary.
- In-app browser review — at 390 px and 1440 px, dark/light landing and result views had no
  horizontal overflow; ES→EN updated `<html lang>` and the interface; the cached Alex
  example rendered the complete 71/100 audited result with one `h1`, five `h2` dimensions,
  and `h3` findings. No browser-console warnings or errors were recorded.
- `git diff --check` — passed.

### Decisions

- `CVLENS_SITE_URL` is the single origin authority for canonical, social, JSON-LD, robots,
  and sitemap URLs. It is normalized to an HTTP(S) origin and rejects embedded credentials.
- Only the public home is indexable. Robots excludes `/api/` and `/health`, and the sitemap
  contains only `/`; neither endpoint is a content page.
- Metadata icons use App Router file conventions without duplicate manual icon metadata.
- JSON-LD is static product description only. It carries the per-request nonce, adds no
  tracker or remote asset, and does not describe scores, users, or CV contents.
- The HTML language follows the currently rendered interface/result language. It remains
  independent from browser or operating-system settings when analysis output is shown.
- No extraction contract, deterministic rubric, cached example, upload/request boundary,
  API secret handling, privacy copy, persistence behavior, or server architecture changed.

### Known debt / blockers

- No Phase 8 blocker.
- Lighthouse still reports one generic Chrome “Content security policy” inspector issue
  with no affected URL or actionable detail, leaving Best Practices at 96. Direct nonce
  inspection passes, the browser console is clean, and security headers remain intact; the
  issue is documented in `docs/seo.md` rather than weakening CSP.
- Lighthouse performance values are lab measurements and may vary with network/host load;
  no performance guarantee is inferred from the 78→99 sample.
- The production deployment again came from the local working tree and remains uncommitted;
  commit/push are intentionally left to the maintainer.

## Phase 8 handoff — fulfilled

Phase 8 is complete and deployed. Its handoff was fulfilled by the Phase 9 implementation
below.

## Phase 9 work log

### Files changed

- Added the bounded optional job-description policy in
  `src/domain/job-match/job-description.ts`: omitted/blank input preserves the CV-only path;
  supplied input is trimmed and limited to 40–6,000 characters. Non-string or out-of-range
  multipart input is rejected before a provider call.
- Added the strict cited grounding contract in `src/domain/job-match/contract.ts` and the
  combined CV/job structured-output contract in `src/domain/job-match/grounded-contract.ts`.
  Each of at most twelve material requirements needs verbatim job evidence; positive or
  partial coverage needs verbatim CV evidence; `not_demonstrated` means only absent evidence
  in this CV; `not_evaluable` requires an explicit reason. Scores and contact values are
  rejected.
- Added the pure deterministic job-match engine in `src/domain/job-match/score.ts`:
  required/preferred/unspecified weights are 2/1/1; covered/partial/not-demonstrated points
  are 100/50/0; non-evaluable requirements are excluded. This result is separate from and
  does not modify the existing CV-quality rubric.
- Extended the Anthropic adapter and prompts with a grounded extraction path, a 9,000-token
  output cap, explicit prompt-injection/protected-attribute/contact/hiring-prediction rules,
  exact requirement-quote validation, and exactly one independent reinspection after a
  schema or grounding failure. The existing no-job extraction path is unchanged.
- Added `src/server/analysis/select-extraction.ts` so validated absence selects only the
  original extractor and a supplied job selects only the grounded extractor. Updated the
  upload pipeline and API result to carry an optional match while retaining immediate CV
  buffer disposal, safe errors, rate limiting, deadlines, and request headers.
- Added the optional textarea and bounded validation to `src/components/cvlens-app.tsx`;
  live responses are schema-validated and rescored in the browser. Added a separate
  evidence-expandable job-match card, responsive dark/light styling, explicit absence-of-
  evidence language, and deterministic recommendations that prohibit invented experience.
- Added three fictional job fixtures under `fixtures/jobs/` and reviewed cached comparisons
  in `src/data/cached-job-match-extractions.ts`. The existing Alex, Marina, and Dayo examples
  now show paired job matches without a network/model call; their CV-quality results remain
  unchanged.
- Added tests across `src/domain/job-match/`, `src/data/`, `src/server/analysis/`, the
  Anthropic reinspection boundary, and upload pipeline. Added `docs/job-grounding.md` with
  privacy, contract, scoring, fixtures, recommendations, and verification details; updated
  `README.md`.

### Commands and validation

- `pnpm typecheck` — passed (`tsc --noEmit`, strict TypeScript, exit 0).
- `pnpm lint` — passed (`eslint .`, zero warnings/errors, exit 0).
- `pnpm test` — passed: 30 test files, 158 tests, exit 0. Coverage includes bounds,
  cross-field schema rules, contact rejection, exact job quotes, one reinspection,
  deterministic weights/renormalization, source-backed fixtures, CV-only/grounded provider
  selection, and buffer disposal.
- `pnpm build` — passed with Next.js 16.2.10/webpack, exit 0; compilation, TypeScript, page
  generation, and build traces completed. `/`, `/api/analyze`, `/health`, icon/social routes,
  `/robots.txt`, and `/sitemap.xml` compiled; Proxy middleware compiled.
- `git diff --check` — passed before the final status-only edit; no whitespace errors.
- Local production browser smoke (`pnpm start`, `127.0.0.1:3002`) — desktop and 390×844
  result layouts had no horizontal overflow in dark or light themes; `<html lang>` followed
  the EN cached result; the heading hierarchy remained one result `h1`, job/dimension `h2`s,
  and finding `h3`s.
- Optional-input manual check — blank input remained valid; a 15-character non-empty input
  displayed the 40-character validation error and the 6,000-character counter.
- Cached-flow manual check — Alex completed without a live provider call, retained the
  existing CV-quality score of 71/100, and displayed a separate deterministic job-match
  score of 75/100. The expanded Next.js requirement showed its exact job quote, exact CV
  skills quote, partial explanation, and anti-invention recommendation.
- Browser console — zero warnings and zero errors after landing, validation, cached result,
  evidence expansion, responsive resize, and both theme toggles.

### Hand-verified deterministic job-match fixtures

| CV / job pair | Coverage states | Score | Evidence coverage |
| --- | --- | ---: | ---: |
| Alex / Junior Frontend Developer | 2 covered, 1 partial, 1 not demonstrated | 75 | 100% |
| Marina / Senior Backend Engineer | 2 covered, 1 partial, 1 not demonstrated | 71 | 100% |
| Dayo / Full-stack Engineer | 3 covered, 1 not demonstrated | 86 | 100% |

Every requirement quote is asserted against its fictional job source and every claimed CV
quote against its fictional CV source in `src/data/cached-job-match-extractions.test.ts`.

### Decisions

- Job match and CV quality remain distinct results. A strong match cannot improve a weak CV
  score, and a polished CV cannot manufacture job coverage.
- Priority is categorical extraction only; numeric weights live exclusively in pure
  TypeScript. `required`/`preferred` are used only when explicit job wording supports them;
  otherwise priority is `unspecified`.
- `not_demonstrated` is absence of evidence in the submitted CV, never a statement about the
  person. Recommendations tell the user to add an example only when true and verifiable,
  otherwise preserve an honest gap.
- The job description shares the existing request-local, no-storage/no-logging privacy
  boundary. It adds no database, analytics, tracker, external asset, client secret, or new
  public metric dimension.
- The 6,000-character job bound fits inside the existing 8 MiB plus 64 KiB multipart request
  allowance, so the hardened content-length boundary was not expanded.
- Phase 9 was verified locally and was not deployed as part of this turn; the public Railway
  service therefore remains on the completed Phase 8 release until the maintainer chooses a
  deployment action.

### Known debt / blockers

- No Phase 9 product blocker.
- Exact job quotes are mechanically checked against submitted text. Exact CV evidence
  remains enforced by the model contract, reviewed fixtures, and reinspection, because the
  multimodal upload adapter does not retain a second plain-text copy of the CV for substring
  comparison.
- A live provider call was not used for the manual smoke, avoiding unnecessary processing
  of uploaded content; the grounded adapter is covered at schema/reinspection/selection
  boundaries and the three cached comparisons are fully source-verified.
- The production deployment still comes from the Phase 8 working tree. Phase 9 changes are
  uncommitted and undeployed; commit, push, and deploy are intentionally left to the
  maintainer.

## Phase 8 maintenance hotfix — Turbopack favicon compatibility

### Files changed

- Updated `scripts/generate-app-icons.mjs` to add an opaque alpha channel after flattening
  the brand SVG and to fail generation unless Sharp reports four channels.
- Regenerated `src/app/favicon.ico`, `src/app/icon.png`, and `src/app/apple-icon.png` as
  RGBA assets. The ICO still contains the intended 16, 32, and 48 px PNG entries.
- No Phase 9 domain, API, UI, fixture, privacy, or scoring behavior changed in this hotfix.
  The generated `next-env.d.ts` development-path change was already present from the
  maintainer's running dev server and was preserved without manual editing.

### Commands and validation

- `node scripts/generate-app-icons.mjs` — passed, exit 0; the generator's four-channel
  assertion passed for every generated size.
- `file src/app/favicon.ico src/app/icon.png src/app/apple-icon.png` — all assets identified
  as 8-bit RGBA. Direct Sharp inspection of every ICO entry reported PNG with 4 channels at
  16, 32, and 48 px.
- `pnpm typecheck` — passed (`tsc --noEmit`, strict TypeScript, exit 0).
- `pnpm lint` — passed (`eslint .`, zero warnings/errors, exit 0).
- `pnpm test` — passed: 30 test files, 158 tests, exit 0.
- `pnpm build` — passed with Next.js 16.2.10/webpack, exit 0; all ten app routes generated
  and Proxy middleware compiled.
- Turbopack development smoke — the maintainer's existing `localhost:3001` server changed
  from the reported ICO decode failure to `✓ Compiled in 132ms` after regeneration. A clean
  restart reached `Ready in 745ms`; `/` returned HTTP 200.
- Manual browser asset check — `http://127.0.0.1:3001/favicon.ico` loaded as a complete
  48×48 image, while the home rendered normally instead of showing the build-error overlay.
- `git diff --check` — passed with no whitespace errors.

### Decisions

- Keep PNG-compressed entries in the multiresolution ICO, but emit RGBA rather than RGB so
  the same asset works in both the production webpack build and the stricter Turbopack
  development decoder.
- Make channel validation part of the reproducible generator so a future regeneration
  cannot silently reintroduce this compatibility regression.
- The hotfix reopens and closes only Phase 8 maintenance. Phase 10 was not activated.

### Known debt / blockers

- No favicon blocker remains.
- Development mode still reports the pre-existing React nonce hydration warning because
  the browser exposes nonce attributes as empty while the server-rendered prop contains the
  CSP nonce. This is independent of favicon decoding; production nonce/header verification
  remains the Phase 8 authority and was not weakened.
- The RGBA hotfix is local and not deployed. Production continues to serve the Phase 8
  release until the maintainer chooses to deploy the accumulated Phase 9 and hotfix changes.

## Current handoff

Phase 9 and the Phase 8 Turbopack favicon hotfix are complete. No phase is active. Activate
only Phase 10 next if explicitly asked; do not begin it automatically. Preserve the RGBA
icon generator assertion, separate CV-quality/job-match scores, strict cited contracts,
deterministic scoring modules, no-invention recommendations, cached example path, hardened
request boundary, no-storage/no-logging policy, CSP nonce and SEO metadata,
one-replica/no-database architecture, and absence of analytics or external assets.
