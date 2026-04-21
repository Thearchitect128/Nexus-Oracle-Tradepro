# Cross-Layer Consistency Contract

This artifact finalizes the system at the governance layer.

## Purpose

The project now has four distinct but connected surfaces:

1. **Formal core** — what is mechanically true.
2. **Governance layer** — what may change and under which admission rules.
3. **Artifact layer** — what is published, displayed, and inherited.
4. **Sandbox layer** — what may be explored without contaminating the core.

The system is finished only when these layers cannot silently contradict one another.

## Contract

The cross-layer contract is:

- the formal core must imply governance permissions,
- governance permissions must bound artifacts,
- the sandbox must remain isolated from the core,
- and no artifact may negate what the formal core asserts.

## Intended repo placement

- `spec/SystemConsistency.tla`
- `docs/SystemConsistency.md`
- optional Oracle / Proof UI badge:
  - `Consistency: PASS`
  - `Consistency: FAIL`

## Minimal adoption plan

1. Add `SystemConsistency.tla` to the repo.
2. Bind abstract state sets to concrete repo enums.
3. Replace helper predicates with:
   - actual spec invariants,
   - governance admission predicates,
   - artifact consistency checks,
   - sandbox isolation checks.
4. Run TLC on a bounded model.
5. Surface the result in the Proof page and Digital Mirror.

## What counts as success

The system is finalized when all four layers remain aligned:

`Spec -> Governance -> Artifacts`, with `Sandbox` isolated.

At that point, the project is not just built. It is governed.
