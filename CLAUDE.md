# Claude Code handoff

Read `AGENTS.md` and `STATUS.md` in full before making changes. Both apply to Claude
Code; `STATUS.md` determines the only phase that may be worked on.

## Claude-specific reminders

- Inspect the current diff before editing because Codex and Claude alternate on this repo.
- Do not reinterpret model findings as scores. Scoring belongs exclusively to the pure
  TypeScript rubric engine.
- Do not call Anthropic for bundled examples; use only reviewed repository fixtures.
- Do not expose `ANTHROPIC_API_KEY` to client components or browser bundles.
- Record a complete handoff in `STATUS.md`, including commands and unresolved debt, and
  stop before activating the following phase.
