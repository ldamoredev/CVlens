# CVLens UI/UX reference

This directory preserves the approved Claude Design reference supplied on 2026-07-13.
It is a visual specification, not production application code.

## Files

- `cvlens-reference.dc.html`: complete design document and interactive reference.
- `support.js`: generated Design Canvas runtime required by the HTML file.

Keep both files together. The HTML loads `support.js` using a relative path and loads
Space Grotesk and JetBrains Mono from Google Fonts when network access is available.

## Integrity

The imported files are exact copies of the supplied reference:

```text
f70df0f0d224f97d7e978778f7340d03128c5bb889ff45cb011afafaf4c63022  cvlens-reference.dc.html
ae4f0ac8449655e17cca1e3b179effcb6817a3b0d8dc47f112a9c39c25c39fd7  support.js
```

Do not edit these imported artifacts in place. If the design changes, add a clearly
versioned replacement and record the decision in `STATUS.md` so agents can distinguish
the approved reference from implementation adjustments.

## Implementation rule

Adopt the reference incrementally according to `STATUS.md`:

- Phase 1 owns the visual system, landing, upload surface, examples, responsive layouts,
  mock result skeleton, and prescribed UI states.
- Phase 5 owns the complete result, expandable evidence, and recommendations.
- Phase 6 owns production error handling, rate limiting, security, and privacy hardening.

Later-phase screens shown by the reference are context only until their phase becomes
active. The reference never overrides product invariants, accessibility requirements,
privacy rules, or the probabilistic-extraction/deterministic-scoring boundary.
