# CVLens results presentation

Owner: Phase 5  
Source of truth: `src/data/analysis-presentation.ts`

## Purpose

The result view makes the separation between extraction and calculation visible. It shows
the overall deterministic score, global evidence coverage, five dimension scores, and all
18 rubric criteria. No finding is hidden merely because it is positive or unavailable.

The output language follows the validated CV language. Browser and operating-system
language are used only as a fallback when the extraction explicitly reports
`undetermined`.

## Information hierarchy

The sticky summary contains:

- overall score and complete/partial state;
- source provenance: reviewed cached fixture or discarded live upload;
- number of dimensions with a published subscore;
- global evidence coverage;
- a short reminder that the document, not the person, is evaluated.

Each of the five expandable dimensions contains:

- its deterministic subscore, state, and evidence coverage;
- evaluated criteria versus total criteria;
- every criterion in the same stable order as the rubric;
- the criterion's local weight and fixed categorical points;
- the model's validated explanation;
- every verbatim evidence quote and its non-sensitive location;
- a concrete deterministic editing action.

For `not_evaluable`, points are displayed as excluded from calculation, the evidence area
uses the dotted uncertainty motif, and the validated reason replaces the quote. The UI
never renders a silent zero or an invented citation.

## Recommendation safety

Recommendations are deterministic templates selected by criterion, outcome, and document
language. They are not produced by an additional model call. Actions may reorganize,
clarify, or rewrite only information already present in the CV. Templates explicitly
forbid invented metrics, results, dates, activities, role types, and skills.

Examples of allowed guidance:

- move an existing verified metric into the cited achievement;
- convert an existing skills table into a one-column plain-text list;
- correct a contradictory date after checking the source record;
- connect a listed skill to an existing role or remove it when unsupported.

The report never attempts to write contact values. The contact criterion can recommend a
clear category header, while its values remain excluded from evidence and presentation.

## Portfolio capture

The desktop layout keeps the overall score beside the dimension audit. Mobile stacks the
same information without a horizontal table, preserves 44 px interactive targets, and
keeps the five dimension accordions usable at 390 px. Dark and light themes share the
dotted-to-solid verification motif.

Exporting the report as a file remains explicitly deferred. Phase 6 owns production
hardening states and must not alter the scoring or recommendation boundary documented
here.
