# Kernel Loop

The OMEGA kernel loop turns raw envelope inputs into an operator-readable
evaluation. It is intentionally small and deterministic so the browser surface,
the Digital Mirror, and the formal artifacts can all describe the same state.

## Loop Stages

1. Sense
   Gather the current envelope inputs: `W`, `inside`, `margin`, `gap`, `kink`,
   facet classification, and the oracle mode.
2. Frame
   Select the active facet and the relevant support bounds for the current
   state.
3. Evaluate
   Compute the envelope report, including `kinkProximity`, `supportGap`,
   `inPhiAttractor`, and `lawCompliance`.
4. Select
   Emit the next operator-facing interpretation without mutating the source
   evidence.
5. Act
   Hand the report to the UI, agents, or the Digital Mirror.

## Inputs and Outputs

The kernel implementation lives in `src/lib/oracleKernelCore.ts`.

Input fields:

- `W`
- `inside`
- `margin`
- `gap`
- `kink`
- `weights.C_r`
- `classification.facet`
- `classification.label`
- `classification.M_min`
- `state.mode`

Output fields:

- `activeFacet`
- `facetLabel`
- `supportGap`
- `kinkProximity`
- `inPhiAttractor`
- `attractorId`
- `lawCompliance`

## Guarantees

- The kernel is read-only with respect to its inputs.
- `lawCompliance` is always present in the report.
- `inPhiAttractor` is only true when the state is both inside the envelope and
  in the phi-weighted facet family.
