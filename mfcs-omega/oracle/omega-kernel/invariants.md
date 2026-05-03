# Kernel Invariants

These invariants keep the oracle output legible and safe for downstream use.

## Structural Invariants

- Every evaluation returns a complete `EnvelopeReport`.
- `lawCompliance.lawId` is always `phi-A`.
- `dimension` is fixed by the kernel constructor and never inferred ad hoc.

## Behavioral Invariants

- `inPhiAttractor` requires both `inside = true` and facet membership in the
  phi family.
- `attractorId` is present only when `inPhiAttractor` is true.
- `lawCompliance.inAttractor` mirrors `inPhiAttractor`.
- `lawCompliance.irreversible` depends only on the active oracle mode.

## Operator Invariants

- No move without a trace.
- No trace without an envelope.
- No override without an audit record.
- No published mirror without a valid JSON payload.
