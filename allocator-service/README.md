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
