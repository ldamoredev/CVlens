# CVLens — Project status

Last updated: 2026-07-13

`STATUS.md` is the source of truth for phase ownership and handoffs. Work only on the
phase marked `IN_PROGRESS`; do not begin the next phase automatically.

## Active phase

**None. Phase 3 is complete; Phase 4 remains `NOT_STARTED`.**

The next agent must explicitly mark Phase 4 `IN_PROGRESS` before changing its code.

## Roadmap

| Phase | Name | Status | Priority / gate |
| --- | --- | --- | --- |
| 0 | Bootstrap | COMPLETED | MVP day 1; completed 2026-07-13 |
| 1 | Visual foundation + examples | COMPLETED | Light-theme amendment completed 2026-07-13 |
| 2 | Anthropic extraction contract | COMPLETED | MVP day 1; completed 2026-07-13 |
| 3 | Deterministic rubric engine | COMPLETED | MVP day 1; completed 2026-07-13 |
| 4 | Real upload + example caching | NOT_STARTED | MVP day 2 |
| 5 | Results, evidence, and recommendations | NOT_STARTED | MVP day 2 |
| 6 | Hardening | NOT_STARTED | MVP day 2 |
| 7 | Tests, fixtures, and launch | NOT_STARTED | MVP day 2; MVP release gate |
| 8 | Grounding against job description | NOT_STARTED | **HIGH — first post-MVP priority** |
| 9 | Generate three CV versions | NOT_STARTED | Post-deploy; blocked until Phase 8 is complete |

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

### Phase 8 — Grounding against job description

- Optional bounded job-description input; cited requirement extraction and evidence-
  backed coverage states; deterministic coverage score; match recommendations that
  never invent experience; at least three hand-verified CV/job fixtures.

### Phase 9 — Generate three CV versions

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

## Deferred ideas — do not implement during phases 0–9

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

## Current handoff

Phase 3 is complete and validated. Activate only Phase 4 next. Use the server-only API key
without reading or logging it, validate files before provider calls, pass only Zod-validated
extractions into `scoreExtraction`, clear upload buffers promptly, and keep examples cached
with no live demo calls. Do not begin the Phase 5 result redesign during that handoff.
