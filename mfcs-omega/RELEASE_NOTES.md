# MFCS–OMEGA v0.1.0 — Initial Unified Release

## Summary

This is the first unified release of the MFCS–OMEGA system, combining:

- MFCS formal specification and TLC harness
- OMEGA Oracle kernel, spatial layer, agents, and console
- Digital Mirror reviewer artifact
- Codex + VS Code extension
- CI/CD, packaging, and checksums

## Highlights

- **Unified repo:** All prior branches and artifacts consolidated into `mfcs-omega/`.
- **Formal core:** `spec/` and `tlc/` provide a complete verification and trace pipeline.
- **Oracle stack:** `oracle/` defines kernel loop, spatial lattice, agents, and operator console.
- **Digital Mirror:** `digital-mirror/` exposes a reviewer-facing JSON mirror and schema.
- **Developer tooling:** `tools/` and `.github/workflows/` support verification and packaging.
- **IDE integration:** `codex/` includes a VS Code extension scaffold and Copilot contracts.

## Operator Checklist for v0.1.0

- [x] Run `./tools/verify.sh`
- [x] Generate checksums via `tools/scripts/generate_checksums.py`
- [x] Build Digital Mirror via `tools/build-mirror.py`
- [x] Package release via `./tools/package.sh`
- [x] Tag `v0.1.0` and push to GitHub

## Known Next Steps

- Tighten invariants and envelope laws in `spec/modules/`.
- Expand MFCS paper sections in `paper/mfcs-paper.tex`.
- Enrich Oracle spatial surfaces and agent protocols.
- Flesh out Codex prompt contracts and examples.
