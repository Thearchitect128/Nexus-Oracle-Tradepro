# Architecture Overview

MFCS–OMEGA is organized into:

- **MFCS core** (`spec/`, `tlc/`): formal specification and empirical falsification.
- **OMEGA Oracle** (`oracle/`): kernel, spatial layer, agents, and operator console.
- **Digital Mirror** (`digital-mirror/`): reviewer-facing artifact and schema.
- **Codex** (`codex/`): integration with VS Code and Copilot.

Each layer is self-contained but shares global invariants and envelope laws.

# Architecture Diagram (ASCII)

```text
                 +----------------------+
                 |      MFCS Core      |
                 |  spec/   +   tlc/   |
                 +----------+----------+
                            |
                            v
                 +----------------------+
                 |   Trace Pipeline    |
                 |  traces/ + adapters |
                 +----------+----------+
                            |
                            v
                 +----------------------+
                 |   Digital Mirror    |
                 |  digital-mirror/    |
                 +----------+----------+
                            |
                            v
+-----------+      +----------------------+      +------------------+
|  Codex    |<---->|      OMEGA          |<---->|  Operator Console |
|  codex/   |      |  oracle/            |      |  oracle/console/  |
+-----------+      +----------------------+      +------------------+

Legend:
- MFCS Core: formal spec + TLC
- OMEGA: kernel, spatial layer, agents
- Digital Mirror: reviewer-facing state
- Codex: IDE/Copilot integration
- Console: operator-facing surfaces
```
