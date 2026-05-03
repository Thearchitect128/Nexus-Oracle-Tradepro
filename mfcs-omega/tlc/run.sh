#!/usr/bin/env bash
set -euo pipefail

MODEL_NAME="${1:-MFCS}"
TLA_FILE="../spec/${MODEL_NAME}.tla"
CFG_FILE="../spec/${MODEL_NAME}.cfg"

if [[ -n "${TLA_JAR:-}" ]]; then
  TLA_TOOLS_JAR="${TLA_JAR}"
elif [[ -n "${TLA_HOME:-}" ]]; then
  TLA_TOOLS_JAR="${TLA_HOME}/tla2tools.jar"
else
  echo "[TLC] Missing TLA tools."
  echo "[TLC] Set TLA_JAR to a tla2tools.jar path or set TLA_HOME."
  exit 1
fi

echo "[TLC] Running model: ${MODEL_NAME}"
echo "[TLC] Spec: ${TLA_FILE}"
echo "[TLC] Config: ${CFG_FILE}"
echo "[TLC] Tools: ${TLA_TOOLS_JAR}"

java -XX:+UseParallelGC -cp "${TLA_TOOLS_JAR}" tlc2.TLC -config "${CFG_FILE}" "${TLA_FILE}"
