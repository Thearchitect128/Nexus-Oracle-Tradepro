# Oracle Overview

OMEGA is the operator-facing decision layer that sits on top of the MFCS core.
Its job is to evaluate candidate states against the envelope laws, surface the
active facet and attractor state, and keep every decision legible to a later
operator or reviewer.

## Layers

### Kernel

The kernel reduces envelope inputs into a compact report:

- active facet and label
- margin and support gap
- kink proximity
- law-compliance summary
- phi-attractor membership

See:

- `src/lib/oracleKernelCore.ts`
- `oracle/omega-kernel/kernel-loop.md`
- `oracle/omega-kernel/invariants.md`

### Spatial Layer

The spatial layer turns kernel output into surfaces an operator can read. It
frames the active facet, support geometry, and predicted drift so the oracle is
not a black box.

See:

- `oracle/spatial-layer/lattice.md`
- `oracle/console/decision-surfaces.md`

### Console

The operator console is the practical surface where evaluation, mirror state,
and override controls meet. The browser workbench at `index.html` is the light
weight deployable version of that surface.

See:

- `src/pages/OracleWorkbenchPage.tsx`
- `oracle/console/operator-console.md`

### Agents

Agents may prepare evidence, classify traces, or propose next moves, but they
must never bypass the envelope report or the audit log contract.

See:

- `oracle/agents/agent-spec.md`
- `oracle/agents/audit-log-format.md`
- `oracle/agents/override-protocol.md`

### Digital Mirror

The Digital Mirror is the reviewer-facing artifact that snapshots the current
system story: invariants, recent trace evidence, oracle state, and peaks.

See:

- `digital-mirror/mirror.json`
- `digital-mirror/mirror-schema.md`
- `tools/build-mirror.py`

## Operating Principle

OMEGA should always satisfy four conditions:

1. Every decision has a trace.
2. Every trace is framed by an envelope.
3. Every envelope report can be inspected by an operator.
4. Every override leaves a durable audit record.
