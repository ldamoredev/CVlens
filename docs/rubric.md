# CVLens deterministic rubric

Version: `1.0`  
Owner: Phase 3  
Source of truth: `src/domain/rubric/rubric.ts`

## Boundary

The validated Phase 2 extraction supplies categorical, evidence-backed outcomes. This
pure TypeScript module converts those outcomes into five dimension scores and one overall
score. It does not import Anthropic, Next.js, React, environment variables, or network
code, and it never reads CV text to make a scoring decision.

The same outcomes and rubric version always produce the same result. Explanations,
evidence wording, evidence count, detected language, and invocation order cannot change
a score.

## Outcome points

| Extraction outcome | Rubric points | Treatment |
| --- | ---: | --- |
| `meets` | 100 | Fully satisfies the criterion. |
| `mixed` | 50 | Contains meaningful positive and negative evidence. |
| `needs_improvement` | 0 | Evaluated evidence shows the criterion is not met. |
| `not_evaluable` | — | Excluded from numerator and denominator; never converted to zero. |

The categorical mapping is intentionally simple for the MVP. The model does not choose a
number: it chooses only the evidence-backed outcome allowed by the extraction schema.

## Dimension weights

| Dimension | Overall weight | Rationale |
| --- | ---: | --- |
| Impact and achievements (`impact`) | 30% | Results and quantified impact are the strongest document-quality signal. |
| Clarity and writing (`clarity`) | 20% | Clear writing affects both recruiter scanning and comprehension. |
| ATS structure and readability (`atsStructure`) | 25% | A strong CV must first remain parseable and navigable. |
| Consistency (`consistency`) | 15% | Timeline contradictions materially reduce document trust. |
| Technical/domain signal (`domainSignal`) | 10% | Supported skills matter, but the rubric avoids over-weighting any specific profession. |

The five weights sum to 100%.

## Criterion weights

Each dimension's criterion weights independently sum to 100%.

### Impact — 30% overall

| Criterion | Local weight |
| --- | ---: |
| `resultOrientedBullets` | 45% |
| `quantifiedAchievements` | 35% |
| `actionVerbOpenings` | 20% |

Results receive more weight than stylistic action-verb usage. Metrics are important but
not universally available in every role, so they remain below result orientation.

### Clarity — 20% overall

| Criterion | Local weight |
| --- | ---: |
| `bulletLength` | 25% |
| `emptyJargon` | 25% |
| `passiveVoice` | 25% |
| `tenseConsistency` | 25% |

The four writing checks are equally weighted to avoid encoding a stylistic preference as
more important than basic clarity.

### ATS structure — 25% overall

| Criterion | Local weight |
| --- | ---: |
| `standardSections` | 20% |
| `reverseChronologicalOrder` | 15% |
| `parserSafeFormat` | 30% |
| `completeContactInformation` | 20% |
| `appropriateLength` | 15% |

Parser-safe formatting is the largest ATS factor. Standard sections and the presence of
contact categories follow; chronology and supported document length are smaller factors.
The rubric never scores the content of contact values.

### Consistency — 15% overall

| Criterion | Local weight |
| --- | ---: |
| `unexplainedDateGaps` | 35% |
| `contradictoryDates` | 30% |
| `overlappingDates` | 20% |
| `dateFormatConsistency` | 15% |

Substantive timeline issues outweigh cosmetic date-format differences. Overlap is not
automatically negative: the extraction outcome reflects whether the document explains it.

### Domain signal — 10% overall

| Criterion | Local weight |
| --- | ---: |
| `experienceBackedSkills` | 65% |
| `unsupportedSkillList` | 35% |

Concrete use of a skill carries more weight than the presence of an unsupported list.

## Dimension calculation

For a dimension, let `pᵢ` be the outcome points and `wᵢ` the local criterion weight. Let
`E` contain only evaluable findings:

```text
raw dimension score = Σ(pᵢ × wᵢ) / Σ(wᵢ), for i in E
dimension score     = roundHalfUp(raw dimension score)
coverage            = Σ(wᵢ), for i in E
```

Examples:

- All criteria `meets`: `100`.
- All criteria `needs_improvement`: `0`. This is a real evaluated zero.
- All criteria `mixed`: `50`.
- Impact with `quantifiedAchievements` not evaluable and the other two criteria meeting:
  `(100×45 + 100×20) / (45+20) = 100`, coverage `65%`, state `partial`.
- Clarity with one `meets` and three `mixed` outcomes:
  `(100×25 + 50×25 + 50×25 + 50×25) / 100 = 62.5`, rounded to `63`.

### Dimension states

| State | Rule | Score |
| --- | --- | --- |
| `complete` | All local criterion weight is evaluable (`100%`). | Integer 0–100. |
| `partial` | Some but not all local weight is evaluable. | Renormalized integer 0–100. |
| `insufficient_information` | No criterion in the dimension is evaluable. | `null`, never `0`. |

The output includes each criterion's outcome, fixed points, local weight, and weighted
contribution so the calculation can be shown to a reviewer.

## Overall calculation

The engine does not average already-rounded dimension scores. It calculates each
evaluable criterion's effective global weight:

```text
global criterion weight = dimension weight × local criterion weight / 100
global coverage         = Σ(global criterion weight), evaluable criteria only
raw overall score       = Σ(points × global criterion weight) / global coverage
overall score           = roundHalfUp(raw overall score)
```

This avoids double rounding and prevents a sparse partial dimension from receiving its
full dimension weight. Global coverage is reported to one decimal place for display; the
unrounded value is used in the calculation.

Example at exactly 50% coverage:

- all Impact criteria `meets`: 30 global weight points at 100;
- all Clarity criteria `mixed`: 20 global weight points at 50;
- remaining dimensions not evaluable;
- overall: `(100×30 + 50×20) / 50 = 80`, state `partial`.

## Overall states and publication threshold

| State | Rule | Overall score |
| --- | --- | --- |
| `complete` | Global coverage is 100%. | Integer 0–100. |
| `partial` | Global coverage is at least 50% but below 100%. | Integer 0–100. |
| `insufficient_information` | Global coverage is below 50%. | `null`. |

The 50% gate prevents CVLens from presenting a headline score based on a small readable
fragment. Dimension-level partial scores may still exist below that gate, clearly labeled
with their own coverage, but there is no overall number.

## Rounding

Scores use non-negative round-half-up exactly once, after the full weighted calculation:

```text
roundHalfUp(x) = floor(x + 0.5)
```

Therefore `62.49 → 62`, `62.50 → 63`, and `62.51 → 63`. Intermediate dimension scores
are not used to calculate the overall score.

## Result shape

```ts
interface RubricResult {
  state: "complete" | "partial" | "insufficient_information";
  overallScore: number | null;
  coveragePercent: number;
  dimensions: {
    impact: DimensionScore;
    clarity: DimensionScore;
    atsStructure: DimensionScore;
    consistency: DimensionScore;
    domainSignal: DimensionScore;
  };
}
```

Each `DimensionScore` contains its state, score, coverage, and criterion calculation
details. The source `CvExtraction` continues to own explanations, evidence, and
non-evaluable reasons; the rubric does not copy or alter personal CV content.

## Invariants and phase boundaries

- Missing evidence is represented upstream as `not_evaluable`; it is never a silent zero.
- A score of zero is possible only from evaluated `needs_improvement` findings.
- Inputs are not mutated.
- No randomness, time, locale, model, browser state, or environment variable participates
  in scoring.
- Phase 4 connects validated extraction to this function on the server and for cached
  examples; the browser recomputes the rubric from the validated extraction it receives.
- Phase 5 combines the returned audit data with the original evidence for presentation.
- Changing any weight, outcome value, threshold, or rounding rule requires a documented
  rubric version change and regression-test review.
