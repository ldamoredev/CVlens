# CVLens

CVLens is a public multimodal web app that reviews a PDF or image CV and returns an
auditable document-quality analysis. A model extracts structured, cited findings;
deterministic TypeScript code applies a documented rubric to calculate five dimension
scores and one overall score.

**Phases 0–6 are complete. Phase 7 (tests, fixtures, and launch) is in progress.** See
`STATUS.md` before contributing and activate only the next eligible phase.

## Architecture principle

> Probabilistic extraction, deterministic scoring.

The model never generates scores. It identifies evidence-backed findings and explicitly
marks information it cannot evaluate. A pure domain module will turn those findings into
reproducible scores. This boundary keeps the rubric testable and auditable.

The versioned extraction fields, evidence invariants, language behavior, prompts, and
single controlled reinspection are documented in [`docs/ai-contract.md`](docs/ai-contract.md).
The fixed weights, outcome mapping, coverage states, and rounding formula are documented
in [`docs/rubric.md`](docs/rubric.md).
The upload boundary, image normalization, provider adapter, memory cleanup, and cached
example path are documented in [`docs/upload-pipeline.md`](docs/upload-pipeline.md).
The complete result hierarchy, evidence treatment, and deterministic recommendation
rules are documented in [`docs/results-presentation.md`](docs/results-presentation.md).
The request boundary, quotas, provider deadlines, security headers, safe metrics, and
Railway configuration are documented in [`docs/hardening.md`](docs/hardening.md).
The launch regression corpus, sub-15-second demo path, portfolio copy, LinkedIn draft, and
the Railway deploy runbook are documented in [`docs/launch.md`](docs/launch.md).

## Interface themes

CVLens supports the approved dark and light themes. The initial theme follows the system
preference; a choice made with the header toggle is saved locally for later visits. Theme
selection is independent from the CV's detected language.

## Local development

Requirements:

- Node.js 22 or newer
- pnpm 11.12 or newer (Corepack recommended)

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>.

## Quality commands

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Environment

Copy `.env.example` to `.env.local`. The Anthropic key is server-only and must never use
a `NEXT_PUBLIC_` prefix. The pinned low-cost model can be overridden with
`ANTHROPIC_MODEL`; changing it requires a reviewed-fixture quality decision. Production
preview URLs remain disabled unless `CVLENS_ENABLE_PREVIEW_STATES=true` is set explicitly.
Set `CVLENS_SITE_URL` to the public origin in production so OpenGraph/Twitter metadata and
the OG image resolve to absolute URLs (defaults to `http://localhost:3000`).

## Railway deployment decision

Railway is the fixed deployment target for the MVP:

- one Next.js Node service built with `pnpm build` and started with `pnpm start`;
- one long-lived process, so the MVP's in-memory per-IP rate limiter has coherent state;
- no database, object storage, or persisted upload volume;
- the service reads `PORT` from Railway/Next.js and receives `ANTHROPIC_API_KEY` and
  `ANTHROPIC_MODEL` as service variables;
- uploaded buffers remain ephemeral and must be discarded immediately after analysis;
- Railway checks `GET /health`, which returns only uptime and aggregate analysis metrics;
- `railway.json` declares the Railpack build, start command, one replica, health check,
  and bounded restart policy.

The actual Railway project and public deployment belong to Phase 7.

## Privacy and safety

CVs contain personal data. CVLens does not store uploads; the selected document is sent
to Anthropic for the requested analysis and its request-local buffers are discarded when
processing finishes. Application code must never log CV text, filenames, contact data,
provider payloads, or raw source addresses, comment on protected attributes, or invent
content. Bundled examples are fictional and served from reviewed fixtures without live
model calls.

## Project coordination

- `STATUS.md`: phase status, decisions, validation, and handoff.
- `AGENTS.md`: rules for any coding agent.
- `CLAUDE.md`: additional reminders for Claude Code.
