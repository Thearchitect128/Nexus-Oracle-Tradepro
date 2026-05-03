# Digital Mirror Schema

`digital-mirror/mirror.json` is the reviewer-facing snapshot for the current
repository state.

## Required Top-Level Fields

- `version`
- `source`
- `generated_at`
- `views`
- `invariants`
- `oracle_state`
- `last_run`
- `peaks`

## Field Notes

- `views`: lightweight navigation metadata for surfaces exposed to a reviewer
- `invariants`: the invariants currently surfaced in the mirror
- `oracle_state`: summarized kernel, spatial layer, and agent posture
- `last_run`: trace payload or an empty object when no classified trace exists
- `peaks`: extracted peaks from the most recent classified trace

## Compatibility Rule

The mirror should remain valid JSON and safe to inspect directly in a browser or
through a static deployment.
