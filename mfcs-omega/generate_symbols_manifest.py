#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

TARGETS = [
    "src/lib/symbols/registry.ts",
    "gen/symbols.py",
    "gen/symbols/symbols.go",
]

MANIFEST_PATH = Path("artifacts/symbols.manifest.json")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> None:
    files = {}
    for rel in TARGETS:
        path = Path(rel)
        if not path.exists():
            raise FileNotFoundError(f"Required artifact missing: {rel}")
        files[rel] = f"sha256:{sha256_file(path)}"

    manifest = {
        "version": "v1.0.0-msy-sealed",
        "status": "FROZEN",
        "algorithm": "sha256",
        "root": "TypeScript SSOT",
        "files": files,
    }

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"WROTE: {MANIFEST_PATH}")


if __name__ == "__main__":
    main()
