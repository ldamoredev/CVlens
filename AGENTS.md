# CVLens agent guide

## Start here

1. Read `STATUS.md` completely. It is the source of truth.
2. Work only on the phase marked `IN_PROGRESS`. If no phase is active, activate only
   the next eligible `NOT_STARTED` phase before changing code.
3. Inspect existing code, tests, and the current Git diff before editing.
4. Preserve prior decisions and unrelated user changes.

Do not start a later phase as part of finishing the active phase.

## Product invariants

- Probabilistic extraction, deterministic scoring: the model never emits a score.
- The scoring engine is pure TypeScript and must not import Anthropic, Next.js, or React.
- Findings require verbatim CV evidence. Ambiguity is explicit, never silently assumed.
- Never invent achievements, metrics, dates, employers, skills, or experience.
- Ignore and do not comment on protected attributes, even when present in the CV.
- Detect output language from CV content, not browser or operating-system settings.
- Never persist uploaded files or log CV content/contact details. Clear buffers promptly.
- Preloaded examples are fictional, fixture-backed, and never trigger live API calls.
- Validate all external inputs and avoid `any`.

## Engineering conventions

- TypeScript stays in strict mode.
- Use the Next.js App Router and server-only boundaries for secrets.
- Put domain logic under `src/domain`; keep framework and vendor adapters outside it.
- Tests use Vitest and live beside their unit or in a clearly named test directory.
- Environment variables are documented in `.env.example`; never commit `.env*` secrets.
- Use `pnpm` and keep `pnpm-lock.yaml` committed.
- Railway runs one Node process; do not introduce a database without a documented phase
  decision that changes the approved architecture.

## Required finish checklist

Run, and record exact outcomes in `STATUS.md`:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Also perform a manual check of the affected flow. Do not mark a phase `COMPLETED` when
TypeScript, lint, tests, build, required documentation, or the main flow is broken.

Update the active phase status, files changed, commands run, decisions, known debt, and
handoff. Then stop.
