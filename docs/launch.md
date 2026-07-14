# CVLens — launch, demo, and portfolio copy

Phase 7 owns the public launch surface: the regression corpus, social metadata and OG
image, a sub-15-second demo path, portfolio copy, a LinkedIn draft, and the Railway
deploy. This document collects the launch-facing material; engineering invariants stay in
`STATUS.md`, `AGENTS.md`, and the other `docs/` files.

## Regression corpus

The launch regression corpus lives in `src/data/regression-fixtures.ts` and is exercised by
`src/data/regression-fixtures.test.ts`. It contains five fictional, schema-valid fixtures,
each paired with the fictional source CV that backs its verbatim quotes:

| Fixture | Language | State | Overall | Coverage |
| --- | --- | --- | --- | --- |
| `alex-kessler` | EN | complete | 71 | 100% |
| `marina-rivas` | ES | partial | 82 | 82.3% |
| `dayo-okafor` | EN | partial | 79 | 95% |
| `lucia-fernandez` | ES | complete | 98 | 100% |
| `noor-hassan` | EN | insufficient_information | — | 13.8% |

The corpus covers both document languages (two Spanish, three English) and all three
coverage states. `lucia-fernandez` pins the complete state in Spanish and `noor-hassan`
pins the insufficient-information path (a low-quality scan whose body is illegible), which
the three bundled demo examples do not otherwise exercise. Every quote is asserted to be a
verbatim substring of its source CV, and scoring is asserted deterministic. No fixture ever
performs a network or model call.

## Sub-15-second demo path

The portfolio demo never waits on the model. The bundled examples are reviewed cached
extractions scored by the deterministic rubric at runtime.

1. Open the deployed URL. The idle landing renders immediately.
2. Click a fictional example card (e.g. **Marina Rivas · ES** or **Alex Kessler · EN**).
3. A short client-only progress animation runs, then the full audited result appears:
   overall score, five expandable dimensions, verbatim evidence, and safe recommendations.

This path involves zero Anthropic latency and completes well under 15 seconds. The result
carries the `reviewed fixture · no API` provenance badge so viewers can see it is cached.

For a live capture, upload one of the fictional CVs under `fixtures/cvs/` rendered as a
PDF or image; a real analysis typically completes in ~20–30 seconds (provider dependent)
and is not part of the sub-15-second path.

## Portfolio copy

### English

> **CVLens — verifiable CV analysis.** CVLens reviews a PDF or image CV and returns an
> auditable, evidence-backed quality report. A model extracts structured, cited findings
> from the document; pure TypeScript then applies a documented rubric to produce five
> dimension scores and one overall score. The model never invents a score, every finding
> is tied to a verbatim quote, and anything that cannot be evaluated is marked explicitly
> instead of guessed. Uploads are never stored. Built with Next.js on Railway.

Short version: *Auditable CV analysis — the model finds cited evidence, deterministic code
does the scoring. No invented results, no stored uploads.*

### Español

> **CVLens — análisis verificable de CVs.** CVLens revisa un CV en PDF o imagen y devuelve
> un informe de calidad auditable y respaldado por evidencia. Un modelo extrae hallazgos
> estructurados y citados del documento; luego TypeScript puro aplica una rúbrica
> documentada para producir cinco puntajes por dimensión y un puntaje general. El modelo
> nunca inventa un puntaje, cada hallazgo se ancla a una cita textual, y lo que no se puede
> evaluar se marca de forma explícita en lugar de adivinarlo. Los archivos subidos nunca se
> almacenan. Hecho con Next.js sobre Railway.

Versión corta: *Análisis auditable de CVs — el modelo encuentra evidencia citada y el
código determinístico hace la puntuación. Sin resultados inventados, sin archivos
guardados.*

## LinkedIn draft

### English

> I built **CVLens**, a small tool that reviews a CV and returns an auditable quality
> report — not a black-box score.
>
> The idea is a strict split: the model only extracts evidence-backed, cited findings from
> the document, and deterministic TypeScript applies a documented rubric to turn those
> findings into scores. So the number is reproducible, every point traces back to a
> verbatim quote, and anything the model can't evaluate is marked explicitly instead of
> guessed. Uploads aren't stored.
>
> You can try it with a few fictional example CVs (no upload needed) in a couple of
> seconds. Built with Next.js, deployed on Railway.
>
> Link in the comments — feedback welcome.

### Español

> Armé **CVLens**, una herramienta que revisa un CV y devuelve un informe de calidad
> auditable — no un puntaje de caja negra.
>
> La idea es una separación estricta: el modelo solo extrae hallazgos citados y respaldados
> por evidencia del documento, y TypeScript determinístico aplica una rúbrica documentada
> para convertir esos hallazgos en puntajes. Así el número es reproducible, cada punto se
> puede rastrear hasta una cita textual, y lo que el modelo no puede evaluar se marca de
> forma explícita en vez de adivinarlo. Los archivos subidos no se guardan.
>
> Se puede probar con varios CVs ficticios de ejemplo (sin subir nada) en un par de
> segundos. Hecho con Next.js, desplegado en Railway.
>
> Link en los comentarios — se agradecen comentarios.

## Railway deploy runbook

Railway is the fixed target: one Node service, no database, in-memory rate limiting (see
`docs/hardening.md` and `railway.json`).

1. Ensure `railway.json` is committed (Railpack build `pnpm build`, start `pnpm start`,
   one replica, health check `/health`, restart on failure).
2. Create the project and a service connected to this repository's `main` branch.
3. Set service variables:
   - `ANTHROPIC_API_KEY` — server-only, never `NEXT_PUBLIC_`.
   - `ANTHROPIC_MODEL` — `claude-haiku-4-5-20251001` (pinned default).
   - `CVLENS_SITE_URL` — the public Railway URL, so OpenGraph/Twitter tags and the OG
     image resolve to absolute production URLs.
   - Leave `CVLENS_ENABLE_PREVIEW_STATES` unset/false in production.
4. Deploy, then generate a public domain.
5. Post-deploy verification:
   - `GET /health` returns `status: ok` and only aggregate, non-sensitive metrics.
   - The landing page renders and a bundled example produces a full result with no API call.
   - `GET /opengraph-image` returns a 1200×630 PNG.
   - One live analysis of a fictional CV returns a deterministic result and increments only
     the aggregate success counter.
