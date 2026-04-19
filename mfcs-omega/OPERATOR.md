# OPERATOR GUIDE — MFCS–OMEGA SYSTEM

This guide defines the operator workflow for the MFCS–OMEGA system, including
verification, packaging, trace analysis, Digital Mirror generation, and Oracle
operation.

---

## 1. Verification Pipeline (MFCS Core)

### Run full TLA+ verification
```bash
./tools/verify.sh
```

This executes:
- MFCS.tla
- All invariants in `spec/modules/Invariants.tla`
- Envelope laws
- Hardstop proofs
- Global liveness

### Run TLC with a specific model
```bash
cd tlc
./run.sh MFCS
```

Traces appear in:
- `tlc/traces/raw/`
- `tlc/traces/classified/`

---

## 2. Trace Analysis

### Convert a raw trace to facets
```bash
python3 tlc/adapters/trace_to_facet.py tlc/traces/raw/trace.json
```

### Classify peaks
```bash
python3 tlc/adapters/peak_classifier.py tlc/traces/raw/trace.json
```

---

## 3. Build the Digital Mirror
```bash
python3 tools/build-mirror.py
```

Outputs:
- `digital-mirror/mirror.json`
- `digital-mirror/mirror-build-log.md`

---

## 4. Package a Release
```bash
./tools/package.sh
```

Outputs:
- `release/mfcs-omega.tar.gz`

Generate checksums:
```bash
python3 tools/scripts/generate_checksums.py
```

---

## 5. OMEGA Oracle Operation

### Kernel Loop
See `oracle/omega-kernel/kernel-loop.md`.

### Spatial Layer
See `oracle/spatial-layer/lattice.md`.

### Agents
See `oracle/agents/agent-spec.md`.

### Operator Console
See `oracle/console/operator-console.md`.

---

## 6. Codex + VS Code Extension

### Build extension
```bash
cd codex/vscode-extension
npm install
npm run build
```

### Activate in VS Code
Press F5 to launch extension host.

---

## 7. GitHub Workflows

- `verify.yml` runs TLA+ verification on every push.
- `release.yml` can be extended to publish artifacts.

---

## 8. First Release Checklist

- [ ] Run verification
- [ ] Generate checksums
- [ ] Build Digital Mirror
- [ ] Package release
- [ ] Tag version
- [ ] Push to GitHub
