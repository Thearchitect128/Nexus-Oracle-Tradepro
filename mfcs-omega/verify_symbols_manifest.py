#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", default="artifacts/symbols.manifest.json")
    args = parser.parse_args()

    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        print(f"MANIFEST_MISSING: {manifest_path}", file=sys.stderr)
        return 1

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    failures: list[str] = []

    files = manifest.get("files", {})
    if not isinstance(files, dict):
        print("MANIFEST_INVALID: 'files' must be a mapping", file=sys.stderr)
        return 1

    for rel_path, expected in files.items():
        path = Path(rel_path)
        if not path.exists():
            failures.append(f"MISSING:{rel_path}")
            continue
        actual = f"sha256:{sha256_file(path)}"
        if actual != expected:
            failures.append(f"HASH_MISMATCH:{rel_path}: expected={expected} actual={actual}")

    if failures:
        print("SYMBOL_MANIFEST_VERIFY: FAIL", file=sys.stderr)
        for item in failures:
            print(item, file=sys.stderr)
        return 1

    print("SYMBOL_MANIFEST_VERIFY: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
