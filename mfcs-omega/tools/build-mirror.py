#!/usr/bin/env python3
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TLC_TRACE = ROOT / "tlc" / "traces" / "classified"
MIRROR = ROOT / "digital-mirror" / "mirror.json"
LOG = ROOT / "digital-mirror" / "mirror-build-log.md"
MANIFEST = ROOT / "digital-mirror" / "mirror-manifest.md"


def load_latest_trace():
    traces = sorted(TLC_TRACE.glob("*.json"), reverse=True)
    if not traces:
        return None, None
    latest = traces[0]
    return json.loads(latest.read_text(encoding="utf-8")), latest


def build():
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    trace, trace_path = load_latest_trace()
    peaks = trace.get("peaks", []) if trace else []

    mirror = {
        "version": "0.1.0",
        "source": "mfcs-omega",
        "generated_at": generated_at,
        "views": [
            {
                "id": "mfcs-core",
                "title": "MFCS Core",
                "description": "Formal spec, proofs, and TLC traces."
            },
            {
                "id": "omega-console",
                "title": "OMEGA Console",
                "description": "Operator-facing envelope and attractor surfaces."
            }
        ],
        "invariants": [
            "TypeOK",
            "OutputWellFormed",
            "LawCompliancePresent",
            "AuditVisible"
        ],
        "oracle_state": {
            "kernel": "stable",
            "spatial_layer": "active",
            "agents": "review_ready"
        },
        "last_run": trace if trace else {},
        "peaks": peaks
    }

    MIRROR.write_text(json.dumps(mirror, indent=2) + "\n", encoding="utf-8")

    trace_label = trace_path.name if trace_path else "none"
    LOG.write_text(
        "# Mirror Build Log\n\n"
        f"- Generated at: `{generated_at}`\n"
        f"- Trace source: `{trace_label}`\n"
        f"- Peaks captured: `{len(peaks)}`\n"
        f"- Mirror output: `{MIRROR.relative_to(ROOT)}`\n",
        encoding="utf-8",
    )

    MANIFEST.write_text(
        "# Mirror Manifest\n\n"
        "- Artifact: `digital-mirror/mirror.json`\n"
        "- Purpose: reviewer-facing summary of the current repository state\n"
        "- Inputs: classified TLC traces plus repository metadata\n"
        "- Consumer surfaces: static operator site, reviewers, CI sanity checks\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    build()
