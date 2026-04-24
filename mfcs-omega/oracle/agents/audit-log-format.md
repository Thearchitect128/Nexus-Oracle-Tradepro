# Audit Log Format

Every recommendation or override touching the oracle should produce a structured
record.

## Required Fields

- `timestamp`
- `actor`
- `action`
- `target`
- `reason`
- `inputs`
- `report`
- `result`

## Example

```json
{
  "timestamp": "2026-04-24T00:00:00Z",
  "actor": "operator",
  "action": "approve_override",
  "target": "G_phi",
  "reason": "Manual escalation after classified trace review",
  "inputs": {
    "facet": "Facet-C",
    "mode": "FUSION"
  },
  "report": {
    "inPhiAttractor": true,
    "irreversible": true
  },
  "result": "accepted"
}
```
