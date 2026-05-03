#!/usr/bin/env python3
import argparse
import hashlib
import pathlib
import sys


def sha256_file(path: pathlib.Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify analysis.json against analysis.json.sha256")
    parser.add_argument("--analysis", default="analysis.json")
    parser.add_argument("--sha", default="analysis.json.sha256")
    args = parser.parse_args()

    analysis_path = pathlib.Path(args.analysis)
    sha_path = pathlib.Path(args.sha)

    if not analysis_path.exists() or not sha_path.exists():
        print("Missing analysis artifact(s)", file=sys.stderr)
        return 1

    expected_line = sha_path.read_text(encoding="utf-8").strip()
    expected_hash = expected_line.split()[0]
    actual_hash = sha256_file(analysis_path)

    if expected_hash != actual_hash:
        print(f"HASH_MISMATCH expected={expected_hash} actual={actual_hash}", file=sys.stderr)
        return 1

    print(f"VERIFIED {analysis_path} sha256={actual_hash}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
