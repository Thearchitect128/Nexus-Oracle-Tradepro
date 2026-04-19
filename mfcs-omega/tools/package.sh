#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/release"
mkdir -p "${OUT_DIR}"

echo "[package] Building release artifact..."
tar czf "${OUT_DIR}/mfcs-omega.tar.gz" \
  --exclude-vcs \
  -C "${ROOT_DIR}" .

echo "[package] Done: ${OUT_DIR}/mfcs-omega.tar.gz"
