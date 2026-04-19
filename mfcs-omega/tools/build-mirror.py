#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIRROR = ROOT / "digital-mirror" / "mirror.json"
LOG = ROOT / "digital-mirror" / "mirror-build-log.md"

#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TLC_TRACE = ROOT / "tlc" / "traces" / "classified"
INVARIANTS = ROOT / "spec" / "modules" / "Invariants.tla"
MIRROR = ROOT / "digital-mirror" / "mirror.json"
LOG = ROOT / "digital-mirror" / "mirror-build-log.md"

def load_latest_trace():
    traces = sorted(TLC_TRACE.glob("*.json"), reverse=True)
    if not traces:
        return None
    return json.loads(traces[0].read_text())

def build():
    trace = load_latest_trace()

    mirror = {
        "version": "0.1.0",
        "invariants": ["TypeOK", "OutputWellFormed"],
        "last_run": trace if trace else {},
        "oracle_state": {
            "kernel": "stable",
            "spatial_layer": "active",
            "agents": "idle"
        },
        "peaks": trace.get("peaks", []) if trace else []
    }

    MIRROR.write_text(json.dumps(mirror, indent=2))

    LOG.write_text(
        "# Mirror Build Log\n\n"
        "- Built v0.1.0 mirror\n"
        f"- Trace included: {bool(trace)}\n"
    )

if __name__ == "__main__":
    build()
