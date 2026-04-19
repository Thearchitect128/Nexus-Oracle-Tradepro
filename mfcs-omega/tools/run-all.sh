#!/usr/bin/env bash
set -euo pipefail

echo "[1/3] Running verification..."
./tools/verify.sh

echo "[2/3] Building Digital Mirror..."
python3 tools/build-mirror.py

echo "[3/3] Packaging release..."
./tools/package.sh

echo "Done. Full pipeline executed successfully."
