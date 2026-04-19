# MFCS–OMEGA Unified Repository

This repository is the canonical home for the MFCS system, the OMEGA Oracle,
the Digital Mirror artifact, and associated tooling for verification,
reproducibility, and operator workflows.

## Structure

- `paper/` — MFCS paper sources, figures, and submission artifacts.
- `spec/` — TLA+ specifications and proof modules.
- `tlc/` — TLC harnesses, traces, and adapters for empirical falsification.
- `docs/` — Architecture, envelope laws, and system overview documents.
- `tools/` — Packaging, verification, CI/CD, and release scripts.
- `oracle/` — OMEGA kernel, spatial layer, agents, and operator console.
- `digital-mirror/` — Reviewer-facing mirror and schema.
- `codex/` — Nonagram Codex, VS Code extension, and Copilot integration.
- `.github/` — GitHub Actions workflows and issue templates.

## Quick start

```bash
git clone <your-repo-url> mfcs-omega
cd mfcs-omega

# Run verification (TLA+ / TLC harness)
./tools/verify.sh

# Package a release artifact
./tools/package.sh
```

See `docs/architecture-overview.md`, `OPERATOR.md`, and `docs/oracle-overview.md` for a guided tour.
