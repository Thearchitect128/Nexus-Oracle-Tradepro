# Integration Layer — Wiring Chapter10 into the React Visualizer

Purpose
-------
Define data model and integration steps so the codespaces-react viz can surface canonical Chapter10 path metadata.
This file is canonical: it defines the JSON schema for chapter10 map, UI contract for PathInspector, and event API.

Canonical JSON model (chapter10.json)
------------------------------------
Top-level:
{
  "version": "v1.0.0",
  "canonicalizedAt": "2026-05-03T00:00:00Z",
  "guardianRows": [
    {
      "id": "Gamma-1",
      "name": "Warden",
      "paths": [
        {
          "pathId": 1,
          "name": "Path 1",
          "channel": "TB",
          "hexagrams": ["Threshold Gate","Breach Detector"],
          "device": {
            "type": "OCXO",
            "model": "SiTime S-200",
            "specs": { "stability": "±0.05 ppb", "notes": "" }
          },
          "thresholds": {
            "timestamp_jitter_ms": 0.5,
            "hash_entropy_min": 128
          },
          "verification": {
            "protocol": "signed-acq-v1",
            "challenge": "time-sync-challenge-v1",
            "falsify_criteria": "dual-clock-desync"
          },
          "notes": "Canonicalized mapping row entry"
        }
      ]
    }
  ]
}

UI contract: PathInspector component
- Props: pathId: number | string
- Behavior: load canonical chapter10.json if not present, render:
  - Guardian, Channel, Device spec, Thresholds, Verification protocol
  - Links to docs/chapter11-adversarial-lattice.md and docs/chapter11-operational-playbook.md
- Actions: "Export proof" (download signed JSON), "Show red-team notes", "Open hardware BOM"

Event API (to be used by viz)
- dispatch new CustomEvent('path:select', { detail: { pathId } });
- PathInspector listens and updates.

Security
--------
- chapter10.json must be canonicalized and versioned under artifacts/ (e.g., artifacts/chapter10.canonical.json).
- All proof exports must be signed offline and signature stored as `.sig` files alongside JSON.
- CI must enforce canonicalization step; see suggested workflow.
