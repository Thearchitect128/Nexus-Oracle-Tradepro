#!/usr/bin/env bash
set -euo pipefail

MANIFEST="${1:-artifacts/symbols.manifest.json}"
KEY="${2:-symbols-signing.pem}"

if [[ ! -f "$MANIFEST" ]]; then
  echo "MANIFEST_MISSING: $MANIFEST" >&2
  exit 1
fi

if [[ ! -f "$KEY" ]]; then
  echo "KEY_MISSING: $KEY" >&2
  exit 1
fi

openssl dgst -sha256 -sign "$KEY" -out "${MANIFEST}.sig" "$MANIFEST"
openssl dgst -sha256 "$MANIFEST" > "${MANIFEST}.sha256"

echo "SIGNED: ${MANIFEST}.sig"
echo "HASHED: ${MANIFEST}.sha256"
