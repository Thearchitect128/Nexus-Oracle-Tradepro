#!/usr/bin/env python3
import hashlib
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "checksums.sha256"

INCLUDE = [
    "README.md",
    "manifest.json",
    "spec/MFCS.tla",
    "tlc/run.sh",
    "tools/package.sh",
]

def sha256(path: pathlib.Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

with OUT.open("w") as f:
    for rel in INCLUDE:
        p = ROOT / rel
        f.write(f"{sha256(p)}  {rel}\n")
