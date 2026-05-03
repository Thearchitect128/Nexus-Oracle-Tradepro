# TEST_MATRIX

This document defines the routing policy dimensions compiled into CI vectors.

## Dimensions

- `env`: `preview | production`
- `mode`: `streaming | non-streaming`
- `risk`: `low | medium | high`
- `decision`: `model | defer | reject`
- `auth`: `protected | bypass`

## Constraints

- streaming vectors require `decision=model`
- high-risk vectors cannot use `auth=bypass`
- streaming vectors cannot use `decision=reject`

## Invariants

- response must include `Content-Type`
- high-risk vectors must not be auto-approved
- deferred vectors must not call external APIs
- streaming vectors must keep latency under 200ms
