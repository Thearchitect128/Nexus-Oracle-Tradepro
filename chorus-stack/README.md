# Chorus Stack Monorepo Starter

This runnable starter organizes the Control Kernel and RTTS simulation components into a lightweight monorepo.

## Layout

- `packages/shared-types`: protocol and domain types used across components.
- `packages/control-kernel`: mode evaluation and assignment policy selection.
- `packages/assignment-engine`: constrained batch assignment algorithm.
- `packages/chorus-core`, `packages/sap-engine`, `packages/rtts-evidence`: interface contracts.
- `tests`: lightweight Control Kernel spec.
- `simulations`: baseline, overload, and survivor-bias inversion simulation scenarios.

## Quick start

```bash
npm install
npm test
npm run build
python3 simulations/rtts_simulation.py
```
