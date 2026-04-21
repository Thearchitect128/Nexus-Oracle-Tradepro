# Next-Layer Implementation Checklist

## Immediate goal
Create a bridge layer that turns the existing verified pieces into a single operator-facing continuity contract.

## Why this is the next step
- **MFCS** already gives a closed, deterministic, formally verified five-phase ring with safety invariants, liveness, HARDSTOP absorption, and compositional proof structure.
- **Fusion** already gives forward invariance, reachability, completeness of the abstraction, and boundedness.
- **The lattice / guardians** already define guarded transition boundaries, 96-path geometry, and contiguous guardian domains.
- **The inheritance packet** already defines a transfer and verification ritual with integrity, simulation, proof, and telemetry checks.

The missing piece is not another theory. It is a **bridge artifact** that preserves continuity across all three systems.

## Deliverables
1. Add a new repo module: `spec/modules/BridgeContinuitySpec.tla`
2. Add a mirror view that surfaces:
   - current MFCS phase
   - guardian domain / path
   - phi safety status
   - rollback status
   - cycle depth
3. Add a trace classifier rule:
   - `NO_ROLLBACK`
   - `APPROX_RECURRENCE`
   - `ALWAYS_PHI_OK`
4. Add an operator console card:
   - Formula status: `≈↻ ∧ ¬(↺) ⇒ Gφ`
   - PASS / FAIL / UNKNOWN
5. Add one worked example trace and one failed trace.

## Acceptance criteria
- No illegal backward phase jumps in MFCS traces.
- No guardian-unwitnessed transition in lattice traces.
- Phi safety remains true across the whole bridged cycle.
- HARDSTOP remains absorbing if any bridge predicate fails.
- Bridge theorem can be checked in TLC at design level.

## Sequence
1. Formalize the bridge spec.
2. Generate one classified witness trace.
3. Surface it in the Digital Mirror.
4. Surface it in the operator console.
5. Add the paper appendix note.

## Paper appendix language (proposed)
"We introduce a bridge-level continuity artifact that interprets approximate recurrence and no-rollback as sufficient conditions for global phi-safety over the composed MFCS-Fusion-Lattice stack."
