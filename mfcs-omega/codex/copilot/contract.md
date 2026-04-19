# Copilot Contract for MFCS–OMEGA

## Purpose

This repository exposes a structured layout that Copilot (and other tools)
can rely on for:

- Formal reasoning (`spec/`, `tlc/`)
- System documentation (`docs/`)
- Oracle behavior (`oracle/`)
- Mirror generation (`digital-mirror/`)
- IDE integration (`codex/`)

## Key Directories

- `spec/` — TLA+ specs and invariants.
- `tlc/` — TLC harness and adapters.
- `oracle/` — kernel, spatial layer, agents, console.
- `digital-mirror/` — mirror JSON + schema.
- `codex/` — VS Code extension and prompt contracts.

## Expected Queries

- “Show me the MFCS invariants.”
- “Where is the kernel loop defined?”
- “How do I run verification?”
- “How do I build the Digital Mirror?”
- “What is the structure of the Oracle agents?”
