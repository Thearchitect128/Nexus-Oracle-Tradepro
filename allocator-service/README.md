# allocator-service

Stateless Fastify API around a min-cost max-flow allocator.

## What it includes

- deterministic request normalization
- constrained assignment validation
- optimal allocation endpoint at `POST /v1/allocate`
- timeout and infeasibility handling
- Dockerized runtime for horizontal scale

> MCMF guarantees optimality relative to the graph and cost model encoded here.
> It does not prove arbitrary policies unless those policies are faithfully represented by that model.

## Run locally

```bash
npm install
npm run dev
```

## API

`POST /v1/allocate`

Example payload:

```json
{
  "items": [{ "id": "i1", "risk": 0.9 }],
  "nodes": [{ "id": "n1", "capacity": 1, "used": 0 }]
}
```

## Lattice matrix compiler

`TEST_MATRIX.md` is the policy source for matrix coverage. Compile executable vectors with:

```bash
npm run lattice:vectors
```

Run one compiled vector through invariant checks:

```bash
npm run lattice:check -- '{"env":"preview","mode":"streaming","risk":"low","decision":"model","auth":"protected"}'
```

> Script naming note: the generator is intentionally `scripts/gen-vectors.ts` (not `gen-108.ts`) so the filename remains true even if vector counts change.
