# OPERATOR GUIDE - MFCS-OMEGA SYSTEM

This guide defines the practical operator workflow for verification, trace
analysis, Digital Mirror generation, packaging, and the browser surface.

## 1. Repository Validation

Run the repository-level checks before formal verification or deployment:

```bash
python tools/validate_repo.py
```

This confirms that the key docs, mirror files, and deployable site assets are
present and internally consistent.

## 2. Verification Pipeline

### Cross-platform verification entrypoint

```bash
python tools/verify.py
```

Requirements:

- Java 17+
- `TLA_JAR` or `TLA_HOME`

### Shell entrypoint

If you already have a Unix-like shell environment configured:

```bash
./tools/verify.sh
```

### Run TLC directly for a specific model

```bash
cd tlc
./run.sh MFCS
```

Traces appear in:

- `tlc/traces/raw/`
- `tlc/traces/classified/`

## 3. Trace Analysis

Convert and classify traces with the adapters in `tlc/adapters/`:

```bash
python tlc/adapters/trace_to_facet.py tlc/traces/raw/trace.json
python tlc/adapters/peak_classifier.py tlc/traces/raw/trace.json
```

## 4. Digital Mirror

Rebuild the reviewer-facing mirror:

```bash
python tools/build-mirror.py
```

Outputs:

- `digital-mirror/mirror.json`
- `digital-mirror/mirror-build-log.md`
- `digital-mirror/mirror-manifest.md`

## 5. Operator Surface

Preview the static operator surface locally:

```bash
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

The page renders:

- repository architecture summary
- live Digital Mirror data from `digital-mirror/mirror.json`
- an envelope workbench that mirrors the oracle kernel logic

## 6. Release Packaging

Package a release artifact:

```bash
./tools/package.sh
```

Optional checksum refresh:

```bash
python tools/scripts/generate_checksums.py
```

## 7. OMEGA Oracle References

- Kernel loop: `oracle/omega-kernel/kernel-loop.md`
- Kernel invariants: `oracle/omega-kernel/invariants.md`
- Spatial lattice: `oracle/spatial-layer/lattice.md`
- Decision surfaces: `oracle/console/decision-surfaces.md`
- Operator console: `oracle/console/operator-console.md`
- Agent protocols: `oracle/agents/agent-spec.md`

## 8. GitHub and Vercel Readiness

- `python tools/validate_repo.py` is the fast GitHub sanity check.
- `python tools/verify.py` is the formal verification entrypoint used in CI.
- The root static site is deployable to Vercel without a build step.

## 9. First Release Checklist

- [ ] Run repository validation
- [ ] Run formal verification
- [ ] Generate or refresh the Digital Mirror
- [ ] Package the release
- [ ] Tag the version
- [ ] Push to GitHub
