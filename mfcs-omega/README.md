# MFCS-OMEGA Unified Repository

MFCS-OMEGA is the canonical home for the MFCS formal core, the OMEGA oracle,
the Digital Mirror artifact, and the operator-facing surfaces that sit on top
of them. This bundle is organized so the formal model, the browser surface, and
the release tooling all describe the same system.

## Structure

- `spec/`: TLA+ specifications, configs, and proof-adjacent modules
- `tlc/`: TLC harnesses, adapters, and trace folders
- `oracle/`: kernel notes, spatial surfaces, agent protocols, and console docs
- `src/`: TypeScript oracle kernel logic plus a React workbench surface
- `digital-mirror/`: reviewer-facing mirror JSON and schema notes
- `docs/`: architecture, laws, and system overviews
- `tools/`: validation, mirror generation, packaging, and verification helpers
- `.github/`: CI workflows

## Quick Start

### Preview the operator site

The repository includes a zero-build static surface at `index.html`, which is
designed to deploy directly to Vercel or preview locally with Python.

```bash
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

### Validate the repository

```bash
python tools/validate_repo.py
```

This checks that the key docs exist, required JSON files are valid, and the
deployable operator surface is present.

### Run formal verification

```bash
python tools/verify.py
```

Requirements:

- Java 17+
- `TLA_JAR` pointing at `tla2tools.jar`, or `TLA_HOME` containing it

GitHub Actions downloads `tla2tools.jar` automatically before running the same
verification entrypoint.

### Build the Digital Mirror

```bash
python tools/build-mirror.py
```

This refreshes:

- `digital-mirror/mirror.json`
- `digital-mirror/mirror-build-log.md`
- `digital-mirror/mirror-manifest.md`

### Package a release artifact

```bash
./tools/package.sh
```

## Vercel Deployment

The root `index.html` is intentionally static so this repository can deploy on
Vercel without a Node build step. Import the repository into Vercel and deploy
the project as a static site; the mirror and docs will be served directly from
the repository tree.

## Guided Tour

Start here:

- `docs/architecture-overview.md`
- `docs/oracle-overview.md`
- `docs/laws/phi-A.md`
- `OPERATOR.md`
