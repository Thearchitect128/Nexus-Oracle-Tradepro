#!/usr/bin/env python3
"""
Canonicalize Chapter10 text mapping into deterministic JSON.
Reads: Chapter10_96Path_Extended_Channel_Map.txt
Writes: artifacts/chapter10.canonical.json
Usage:
  python scripts/canonicalize_chapter10.py path/to/Chapter10_96Path_Extended_Channel_Map.txt
"""

import sys
import json
from pathlib import Path
from datetime import datetime
import hashlib


def stable_key_order(obj):
    if isinstance(obj, dict):
        return {k: stable_key_order(obj[k]) for k in sorted(obj.keys())}
    if isinstance(obj, list):
        return [stable_key_order(x) for x in obj]
    return obj


def compute_sha256_hex(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


def parse_txt(path: Path):
    # Very small deterministic parser: expects "Guardian | Paths | Channel | Hexagrams | What Each Path Does"
    guardians = []
    lines = [l.rstrip("\n") for l in path.read_text(encoding="utf-8").splitlines()]
    # Find table start
    found = False
    headers = []
    for i, line in enumerate(lines):
        if line.strip().startswith("|") and "Guardian" in line:
            headers = [h.strip() for h in line.strip().strip("|").split("|")]
            found = True
            start = i + 2
            break
    if not found:
        raise SystemExit("Can't find table header in input")
    for l in lines[start:]:
        if not l.strip().startswith("|"):
            break
        cols = [c.strip() for c in l.strip().strip("|").split("|")]
        row = dict(zip(headers, cols))
        guardians.append(row)
    return guardians


def build_canonical(guardians, source_path: str):
    out = {
        "version": "v1.0.0-ch10-canonical",
        "canonicalizedAt": datetime.utcnow().isoformat() + "Z",
        "guardians": []
    }
    for g in guardians:
        name = g.get("Guardian")
        pathspec = g.get("Paths")
        channel = g.get("Channel")
        hexagrams = [h.strip() for h in g.get("Hexagrams", "").split(",") if h.strip()]
        notes = g.get("What Each Path Does", "")
        path_entries = []
        if "-" in pathspec:
            a, b = pathspec.split("-")
            rng = range(int(a), int(b) + 1)
        else:
            rng = [int(pathspec)]
        for p in rng:
            entry = {
                "pathId": p,
                "guardian": name,
                "channel": channel,
                "hexagrams": hexagrams,
                "notes": notes,
                "device": {},
                "thresholds": {},
                "verification": {}
            }
            path_entries.append(entry)
        out["guardians"].append({"name": name, "paths": path_entries})
    out["sourceFile"] = source_path
    canonical = stable_key_order(out)
    return canonical


def main():
    if len(sys.argv) < 2:
        print("Usage: canonicalize_chapter10.py <Chapter10_text_file>")
        raise SystemExit(1)
    p = Path(sys.argv[1])
    if not p.exists():
        raise SystemExit(f"Input file not found: {p}")
    guardians = parse_txt(p)
    canonical = build_canonical(guardians, str(p))
    target = Path("artifacts") / "chapter10.canonical.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(canonical, indent=2, sort_keys=True) + "\n"
    target.write_text(data, encoding="utf-8")
    print("WROTE:", target)
    print("SHA256:", compute_sha256_hex(data.encode("utf-8")))


if __name__ == "__main__":
    main()
