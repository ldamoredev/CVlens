# CVLens AI extraction contract

Version: `1.0`  
Owner: Phase 2  
Source of truth: `src/domain/extraction/contract.ts`

## Boundary

Claude extracts document observations. It never returns a dimension score, overall score,
rating, percentage, hiring prediction, or rubric weight. Phase 3 consumes the validated
findings and performs every numeric calculation in pure TypeScript.

The contract is a strict Zod object: unknown fields are rejected at every object boundary.
This makes an attempted `score` field invalid rather than silently discarding it. The
runtime validates the model response even when the provider uses constrained structured
output, because cross-field evidence rules still belong to CVLens.

The selected default is the pinned `claude-haiku-4-5-20251001` model. It remains
configurable through `ANTHROPIC_MODEL`; changing it requires evidence from reviewed
fixtures. Anthropic currently lists Haiku 4.5 as its fastest low-cost model and supports
structured outputs for it:

- [Anthropic model overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)

Phase 2 does not call Anthropic. Phase 4 will attach the PDF/image and connect the provider
SDK to this contract.

## Top-level fields

| Field | Type | Required | Meaning | Example |
| --- | --- | --- | --- | --- |
| `schemaVersion` | literal | yes | Contract version. | `"1.0"` |
| `document` | object | yes | Language detection based only on CV content. | See below. |
| `dimensions` | object | yes | The five complete finding groups. | See criteria table. |

No dimension may be omitted. Every named criterion appears exactly once, including when
it cannot be evaluated.

## Document language

| Field | Type | Meaning | Example |
| --- | --- | --- | --- |
| `document.language` | `es \| en \| undetermined` | Primary language detected from CV text, never browser, OS, filename, or request metadata. | `"es"` |
| `document.languageEvidence` | 0–3 evidence objects | Short non-sensitive quotes proving `es` or `en`. Must be empty for `undetermined`. | `[{"quote":"Experiencia profesional","location":"Encabezado de sección"}]` |
| `document.languageReason` | string or `null` | Required only for `undetermined`; otherwise must be `null`. | `null` |

`undetermined` is mandatory when the document is empty, unreadable, unsupported, or
genuinely ambiguous. It prevents a silent language guess. For `es` and `en`, all
explanations and non-evaluable reasons must use that detected language.

## Finding fields

Every criterion contains the same strict finding shape:

| Field | Type | Meaning | Example |
| --- | --- | --- | --- |
| `outcome` | enum | Evidence-backed categorical result; never numeric. | `"needs_improvement"` |
| `explanation` | string, 1–800 chars | Concise observation in the CV language. | `"Los bullets describen tareas sin resultados medibles."` |
| `evidence` | 0–3 evidence objects | Exact CV excerpts. Required for every evaluated outcome. | See evidence fields. |
| `notEvaluableReason` | string or `null` | Required only for `not_evaluable`; otherwise must be `null`. | `null` |

### Outcomes

| Value | Meaning |
| --- | --- |
| `meets` | The inspected evidence supports document quality for this criterion. |
| `needs_improvement` | The inspected evidence reveals a concrete document problem. |
| `mixed` | The CV contains both positive and negative evidence for this criterion. |
| `not_evaluable` | The available document cannot support a reliable determination. |

`not_evaluable` requires an empty `evidence` array and a reason. Every other outcome
requires at least one evidence quote and a `null` reason. Absence-based observations cite
representative inspected text; if exact support is not possible, the criterion is
`not_evaluable` rather than an assumed absence.

## Evidence fields

| Field | Type | Meaning | Example |
| --- | --- | --- | --- |
| `quote` | string, 1–500 chars | Verbatim text copied from the CV. | `"Reduced processing time by 24%"` |
| `location` | string, 1–120 chars | Non-sensitive section or entry label that lets a reviewer locate the quote. | `"Experience — Operations Lead"` |

Evidence must never quote contact values or protected attributes. A quote is evidence for
the document observation only; it is not proof of a person's real-world ability.

## Dimension criteria

The object keys are stable API identifiers. Their meaning is fixed here so that Phase 3
can define deterministic weights without changing the extraction boundary.

| Dimension | Criterion key | Question answered by the finding |
| --- | --- | --- |
| `impact` | `resultOrientedBullets` | Do experience bullets describe outcomes rather than only duties? |
| `impact` | `quantifiedAchievements` | Are achievements supported with concrete metrics or scale? |
| `impact` | `actionVerbOpenings` | Do bullets begin with clear action verbs? |
| `clarity` | `bulletLength` | Are bullets concise enough to scan? |
| `clarity` | `emptyJargon` | Does the CV avoid unsupported generic claims and empty jargon? |
| `clarity` | `passiveVoice` | Does the writing favor direct active constructions? |
| `clarity` | `tenseConsistency` | Are verb tenses consistent with current and past roles? |
| `atsStructure` | `standardSections` | Are standard CV sections present and recognizable? |
| `atsStructure` | `reverseChronologicalOrder` | Are dated entries ordered newest to oldest? |
| `atsStructure` | `parserSafeFormat` | Is the visible layout parseable without disruptive columns, tables, or graphics? |
| `atsStructure` | `completeContactInformation` | Are essential contact categories visibly present? Contact values are never quoted. |
| `atsStructure` | `appropriateLength` | Is the document length appropriate for the supported one-to-two-page MVP scope? |
| `consistency` | `unexplainedDateGaps` | Are material timeline gaps visible and unexplained? |
| `consistency` | `contradictoryDates` | Do any dates contradict other dates in the CV? |
| `consistency` | `overlappingDates` | Are overlapping roles clear rather than unexplained or confusing? |
| `consistency` | `dateFormatConsistency` | Is date formatting consistent across entries? |
| `domainSignal` | `experienceBackedSkills` | Are declared skills demonstrated in experience or projects? |
| `domainSignal` | `unsupportedSkillList` | Are skills presented only as an unsupported standalone list? |

## Compact example

This excerpt demonstrates every field shape. The real object must include all criteria
listed above, each with the same finding structure.

```json
{
  "schemaVersion": "1.0",
  "document": {
    "language": "es",
    "languageEvidence": [
      {
        "quote": "Experiencia profesional",
        "location": "Encabezado de sección"
      }
    ],
    "languageReason": null
  },
  "dimensions": {
    "impact": {
      "resultOrientedBullets": {
        "outcome": "needs_improvement",
        "explanation": "El bullet describe una responsabilidad, pero no identifica un resultado.",
        "evidence": [
          {
            "quote": "Responsable de coordinar al equipo de soporte",
            "location": "Experiencia — Líder de soporte"
          }
        ],
        "notEvaluableReason": null
      },
      "quantifiedAchievements": {
        "outcome": "not_evaluable",
        "explanation": "La sección está cortada y no permite inspeccionar los bullets completos.",
        "evidence": [],
        "notEvaluableReason": "El texto relevante no es legible en la imagen suministrada."
      },
      "actionVerbOpenings": {
        "outcome": "meets",
        "explanation": "Los bullets visibles comienzan con verbos de acción.",
        "evidence": [
          {
            "quote": "Implementé un nuevo flujo de atención",
            "location": "Experiencia — Líder de soporte"
          }
        ],
        "notEvaluableReason": null
      }
    },
    "clarity": "same strict finding objects for all clarity criteria",
    "atsStructure": "same strict finding objects for all ATS criteria",
    "consistency": "same strict finding objects for all consistency criteria",
    "domainSignal": "same strict finding objects for all domain criteria"
  }
}
```

The compact example is explanatory and intentionally abbreviates four dimensions; it is
not itself schema-valid. Complete valid objects are exercised in
`src/domain/extraction/contract.test-fixture.ts`.

## Prompt contract and safety

`src/server/anthropic/prompts.ts` contains two prompts:

1. The system prompt defines the extraction-only role, treats CV text as untrusted data,
   forbids scores and invention, ignores protected attributes, and requires exact quotes.
2. The analysis prompt enumerates every criterion and tells the model to detect language
   from document content and mark unsupported determinations explicitly.

The prompt never includes a user's CV text through string interpolation. Phase 4 will send
the file as a separate PDF `document` or image content block.

## Controlled reinspection

`extractWithSingleReinspection` accepts provider callbacks and follows this exact state
machine:

1. Invoke the initial extraction once.
2. Parse JSON and validate with Zod.
3. If JSON or schema validation fails, discard the prior value and request one independent
   reinspection of the original attached document. Only structural issue paths/codes are
   included; raw output and CV text are excluded.
4. Parse and validate the new result. If it fails, stop and surface a typed validation
   error. There is no third attempt.

Provider, transport, authentication, timeout, and rate-limit failures do not trigger this
schema retry. Their safe error mapping belongs to Phase 6.

The reinspection instruction explicitly asks the model to start from original evidence,
not to patch or “correct” its previous answer. This reduces the chance of preserving an
unsupported claim merely to satisfy the schema.

## Phase boundaries

- Phase 3 may read these categorical outcomes but must not import Anthropic, Next.js, or
  React.
- Phase 4 owns provider SDK integration, multimodal content blocks, MIME/size validation,
  image resize, buffer cleanup, and cached reviewed example extractions.
- Phase 5 owns the final evidence/recommendation presentation. Recommendations must never
  introduce facts absent from the source CV.
