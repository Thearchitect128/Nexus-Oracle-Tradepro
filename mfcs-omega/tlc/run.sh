#!/usr/bin/env bash
set -euo pipefail

MODEL_NAME="${1:-MFCS}"
TLA_FILE="../spec/${MODEL_NAME}.tla"
CFG_FILE="../spec/${MODEL_NAME}.cfg"

echo "[TLC] Running model: ${MODEL_NAME}"
echo "[TLC] Spec: ${TLA_FILE}"
echo "[TLC] Config: ${CFG_FILE}"

# Adjust path to your TLC installation
java -cp "$TLA_HOME/tla2tools.jar" tlc2.TLC -config "${CFG_FILE}" "${TLA_FILE}"
