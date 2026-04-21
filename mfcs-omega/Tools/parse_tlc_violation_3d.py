#!/usr/bin/env python3
"""Extract 3-resource extrema from a TLC violation trace.

The script scans a TLC violation trace for state snapshots containing
phi, r, s, and e values, computes

    M = e + cphi * phi + cr * r + cs * s

and reports the state with maximal M.
"""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ASSIGNMENT_RE = re.compile(r"\b(phi|r|s|e)\s*=\s*(-?\d+(?:\.\d+)?)")
STATE_START_RE = re.compile(r"^State\s+\d+", re.IGNORECASE)


@dataclass
class Point:
    phi: float
    r: float
    s: float
    e: float
    index: int

    def score(self, cphi: float, cr: float, cs: float) -> float:
        return self.e + cphi * self.phi + cr * self.r + cs * self.s


def classify_peak(cphi: float, cr: float, cs: float) -> str:
    if cphi >= cr and cphi >= cs and cphi > 0:
        return "Peak A (phi-dominant)"
    if cr >= cphi and cr >= cs and cr > 0:
        return "Peak B (r-dominant)"
    if cs >= cphi and cs >= cr and cs > 0:
        return "Peak C (s-dominant)"
    return "Unclassified"


def iter_states(lines: Iterable[str]) -> Iterable[Point]:
    current: dict[str, float] = {}
    index = 0

    def flush() -> Point | None:
        nonlocal index
        needed = {"phi", "r", "s", "e"}
        if needed.issubset(current):
            index += 1
            p = Point(current["phi"], current["r"], current["s"], current["e"], index)
            current.clear()
            return p
        return None

    for raw in lines:
        line = raw.strip()
        if STATE_START_RE.search(line):
            p = flush()
            if p:
                yield p
            continue

        for key, value in ASSIGNMENT_RE.findall(line):
            current[key] = float(value)

    p = flush()
    if p:
        yield p


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("trace", type=Path, help="Path to TLC output trace")
    parser.add_argument("--cphi", type=float, default=0.0)
    parser.add_argument("--cr", type=float, default=0.0)
    parser.add_argument("--cs", type=float, default=0.0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.trace.exists():
        raise SystemExit(f"Trace file not found: {args.trace}")

    points = list(iter_states(args.trace.read_text(encoding="utf-8", errors="ignore").splitlines()))
    if not points:
        raise SystemExit("No states with (phi, r, s, e) found in trace")

    peak = max(points, key=lambda p: p.score(args.cphi, args.cr, args.cs))
    score = peak.score(args.cphi, args.cr, args.cs)
    label = classify_peak(args.cphi, args.cr, args.cs)

    print(label)
    print(f"State index: {peak.index}")
    print(f"Peak tuple: (phi={peak.phi:g}, r={peak.r:g}, s={peak.s:g}, e={peak.e:g})")
    print(f"Envelope M: {score:g}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
