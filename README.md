# CVLens

CVLens is a public multimodal web app that reviews a PDF or image CV and returns an
auditable document-quality analysis. A model extracts structured, cited findings;
deterministic TypeScript code applies a documented rubric to calculate five dimension
scores and one overall score.

**Phase 0 (bootstrap) is complete. Phase 1 has not started.** See `STATUS.md` before
contributing and activate only the next eligible phase.

## Architecture principle

> Probabilistic extraction, deterministic scoring.

The model never generates scores. It identifies evidence-backed findings and explicitly
marks information it cannot evaluate. A pure domain module will turn those findings into
reproducible scores. This boundary keeps the rubric testable and auditable.

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
a `NEXT_PUBLIC_` prefix. Phase 0 does not call Anthropic.

## Railway deployment decision

Railway is the fixed deployment target for the MVP:

- one Next.js Node service built with `pnpm build` and started with `pnpm start`;
- one long-lived process, so the MVP's in-memory per-IP rate limiter has coherent state;
- no database, object storage, or persisted upload volume;
- the service reads `PORT` from Railway/Next.js and receives `ANTHROPIC_API_KEY` and
  `ANTHROPIC_MODEL` as service variables;
- uploaded buffers remain ephemeral and must be discarded immediately after analysis;
- a health endpoint will be introduced in Phase 6 before deployment.

The actual Railway project and public deployment belong to Phases 6–7, not Phase 0.

## Privacy and safety

CVs contain personal data. The application must never persist uploads, log CV text or
contact data, comment on protected attributes, or invent content. Bundled examples are
fictional and served from reviewed fixtures without live model calls.

## Project coordination

- `STATUS.md`: phase status, decisions, validation, and handoff.
- `AGENTS.md`: rules for any coding agent.
- `CLAUDE.md`: additional reminders for Claude Code.
