# Nexus-Oracle-Tradepro / Omega Lattice

Repository for https://replit.com/@monexusoracle/Nexus-Oracle-Tradepro merged with the Omega Lattice proof-of-concept.

A minimal monorepo implementing the "Omega Lattice" proof-of-concept: a WebSocket-driven lattice engine (server) and a Next.js + Three.js client (web) that visualizes lattice state in 3D.

This repository is intended as a developer-ready starting point you can run locally or import into Replit. It includes a simple engine (packages/engine), type facade (packages/types), a WS server (apps/server), and a Next web client (apps/web).

Status: prototype — use for experimentation, visualization, and UI/UX integration.

---

## Quick start

Requirements
- Node.js 18+ recommended
- pnpm (v7+ recommended) — the repo uses pnpm workspaces
- (optional) Git & GitHub CLI if you intend to create/push a repo

Run everything (development)
1. Install packages:
   pnpm install

2. Start both server and web concurrently:
   pnpm dev

This runs:
- WebSocket server on ws://localhost:3001
- Next dev server on http://localhost:3000

Open http://localhost:3000 in your browser.

Run server only
1. cd apps/server
2. pnpm install
3. pnpm dev
- The server will listen on PORT (defaults to 3001).

Run web only
1. cd apps/web
2. pnpm install
3. NEXT_PUBLIC_WS_URL=ws://localhost:3001 pnpm dev -p 3000
- The web client uses environment variable NEXT_PUBLIC_WS_URL to override the WS endpoint.

Replit
- The repository includes `.replit` with Run set to `pnpm install && pnpm dev`. Upload the repo/zip to Replit and set the Run command to that if it’s not set already.
- If Replit prevents two processes on separate ports, run only the web app and set NEXT_PUBLIC_WS_URL to a reachable WS server (or run the WS server in the Next app as an API route — I can show how).

---

## Project structure

- package.json (root) — pnpm workspace config + dev scripts
- tsconfig.json — shared TypeScript paths
- packages/
  - engine/
    - lattice.ts — minimal lattice engine (createLattice, step)
  - types/
    - index.ts — re-exported types
- apps/
  - server/
    - index.ts — WebSocket server that emits lattice state at φ interval (618 ms)
    - package.json
  - web/
    - next.config.mjs
    - src/
      - pages/index.tsx — Next page, top-left HUD + Lattice3D canvas
      - components/Lattice3D.tsx — Three.js visualization
      - hooks/useLatticeSync.ts — WS client sync; uses NEXT_PUBLIC_WS_URL
      - store.ts — zustand store for lattice state

---

## How it works (short)

- `packages/engine/lattice.ts` implements:
  - createLattice(size) -> initial LatticeState with `size` nodes
  - step(state) -> returns next state with small energy drift and recomputed resonance
