# Bridge Continuity Appendix

## Contract

`≈↻ ∧ ¬(↺) ⇒ Gφ`

## Operational Interpretation

- `≈↻`: a forward continuity trace is established.
- `¬(↺)`: no reverse/regression cycle occurs.
- `Gφ`: convergence invariant remains true globally across the trace.

## Artifact Loop

This patch intentionally binds:

1. **Spec** (`spec/modules/BridgeContinuitySpec.tla`)
2. **Runtime classifier** (`src/lib/bridge/traceClassifier.ts`)
3. **Witness traces** (`traces/*.json`)
4. **Executable tests** (`test/bridge-classifier.test.ts`)

Together they produce a closed, deterministic verification loop suitable for reproducible archives.

## Reproducibility Notes

- Sort files before hashing.
- Exclude transient metadata from checksums.
- Use normalized mtimes and `zip -X` for deterministic archive bytes.
