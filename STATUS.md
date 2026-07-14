# CVLens — Project status

Last updated: 2026-07-13

`STATUS.md` is the source of truth for phase ownership and handoffs. Work only on the
phase marked `IN_PROGRESS`; do not begin the next phase automatically.

## Active phase

**None. Phase 1 and its light-theme amendment are complete; Phase 2 remains `NOT_STARTED`.**

The next agent must explicitly mark Phase 2 `IN_PROGRESS` before changing its code.

## Roadmap

| Phase | Name | Status | Priority / gate |
| --- | --- | --- | --- |
| 0 | Bootstrap | COMPLETED | MVP day 1; completed 2026-07-13 |
| 1 | Visual foundation + examples | COMPLETED | Light-theme amendment completed 2026-07-13 |
| 2 | Anthropic extraction contract | NOT_STARTED | MVP day 1 |
| 3 | Deterministic rubric engine | NOT_STARTED | MVP day 1; scope gate for phases 5–6 |
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

## Current handoff

Phase 1, including the light-theme base, is complete. Activate only Phase 2 next; preserve
theme preference behavior and do not couple it to document-language detection.
