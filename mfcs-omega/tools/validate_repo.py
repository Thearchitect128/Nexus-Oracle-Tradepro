#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "README.md",
    "OPERATOR.md",
    "index.html",
    "assets/site.css",
    "assets/site.js",
    "docs/architecture-overview.md",
    "docs/oracle-overview.md",
    "docs/laws/phi-A.md",
    "digital-mirror/mirror.json",
    "digital-mirror/mirror-schema.md",
    "src/lib/oracleKernelCore.ts",
    "src/pages/OracleWorkbenchPage.tsx",
    "spec/MFCS.tla",
    "spec/MFCS.cfg",
]

REQUIRED_NONEMPTY = [
    "README.md",
    "OPERATOR.md",
    "docs/architecture-overview.md",
    "docs/oracle-overview.md",
    "digital-mirror/mirror-schema.md",
    "oracle/omega-kernel/kernel-loop.md",
    "oracle/omega-kernel/invariants.md",
    "oracle/spatial-layer/lattice.md",
    "oracle/console/operator-console.md",
]

JSON_FILES = [
    "manifest.json",
    "digital-mirror/mirror.json",
]


def fail(message):
    print(f"[validate] ERROR: {message}")
    sys.exit(1)


def main():
    missing = [path for path in REQUIRED_FILES if not (ROOT / path).exists()]
    if missing:
        fail(f"missing required files: {', '.join(missing)}")

    empty = [path for path in REQUIRED_NONEMPTY if (ROOT / path).stat().st_size == 0]
    if empty:
        fail(f"critical files are empty: {', '.join(empty)}")

    for rel_path in JSON_FILES:
        try:
            json.loads((ROOT / rel_path).read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            fail(f"invalid JSON in {rel_path}: {exc}")

    mirror = json.loads((ROOT / "digital-mirror/mirror.json").read_text(encoding="utf-8"))
    required_mirror_keys = {
        "version",
        "source",
        "generated_at",
        "views",
        "invariants",
        "oracle_state",
        "last_run",
        "peaks",
    }
    missing_keys = sorted(required_mirror_keys - set(mirror))
    if missing_keys:
        fail(f"digital-mirror/mirror.json is missing keys: {', '.join(missing_keys)}")

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    if "docs/oracle-overview.md" not in readme:
        fail("README.md no longer references docs/oracle-overview.md")

    print("[validate] Repository structure looks consistent.")


if __name__ == "__main__":
    main()
