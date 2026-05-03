#!/usr/bin/env bash
set -euo pipefail

MANIFEST="${1:-artifacts/symbols.manifest.json}"
PUBKEY="${2:-symbols-signing.pub.pem}"

if [[ ! -f "$MANIFEST" ]]; then
  echo "MANIFEST_MISSING: $MANIFEST" >&2
  exit 1
fi

if [[ ! -f "${MANIFEST}.sig" ]]; then
  echo "SIGNATURE_MISSING: ${MANIFEST}.sig" >&2
  exit 1
fi

if [[ ! -f "$PUBKEY" ]]; then
  echo "PUBKEY_MISSING: $PUBKEY" >&2
  exit 1
fi

openssl dgst -sha256 -verify "$PUBKEY" -signature "${MANIFEST}.sig" "$MANIFEST"
