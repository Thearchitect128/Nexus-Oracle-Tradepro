# Omega Lattice

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
- `apps/server` creates a WebSocketServer and broadcasts JSON state on an interval of 618ms (phi-sync homage).
- `apps/web` opens a WebSocket to the server, keeps the lattice state in a zustand store, and renders nodes as spheres in a ring via Three.js.

Commands supported by the server (via WS message):
- send JSON `{ "type": "intent", "payload": "stabilize" }` to reduce node energy (demo intent handler).

---

## Environment variables

- NEXT_PUBLIC_WS_URL — URL for the WebSocket server (default: `ws://localhost:3001`)
- PORT — change server port for apps/server (default 3001)

Set them before starting the web or use an .env approach in your dev environment.

---

## Troubleshooting

- WebSocket connection refused
  - Confirm the server is running on the configured port (3001 by default).
  - If running on Replit, the server port might be different or not exposed. Consider using a single-process approach (served via Next) or a remote WS URL.

- Two-process constraints on Replit
  - If Replit doesn’t allow simultaneous processes bound to separate ports, run only the `web` and point it at a public WS host, or run the WS server inside Next as a lightweight API route.

- pnpm not installed
  - Install locally: `npm install -g pnpm` or use `corepack enable` on newer Node versions.

- TypeScript path resolution errors
  - The root `tsconfig.json` contains path mappings for `@omega/engine` and `@omega/types`. If you open subprojects in an editor, make sure the editor workspace recognizes the root TS config, or adjust local imports to relative paths.

---

## Development suggestions / next steps

- Add a command-line or on-screen command input for UI commands (`stabilize`, `boost`, `prediction`, `trace`).
- Add authentication/authorization if you expose command functions.
- Add unit tests for the lattice engine and snapshot tests for the UI.
- Improve Three.js visualization: color by node.state, add connections/lines for links, add animation on energy changes.
- Bundle server as an API route for easier Replit deployment.

---


## Truth-first interface guardrails

When testing claims that include strong visuals + numeric anchors (e.g., `432 Hz`, `528 Hz`, "resonance" labels), treat them as **unverified inputs** unless they are bound to measurable evidence.

Recommended contract for UI + engine:

- **Provenance required**: every displayed metric must include source id, measurement method, and timestamp.
- **Deterministic mapping**: visual state should be a pure function of validated state, not free text claims.
- **Reproducibility**: values must be derivable from persisted inputs + code version.
- **Invariant enforcement**: if a claim cannot be derived, block render or mark as unverified.
- **Auditability**: hash-lock state transitions and keep an append-only event log for post-hoc verification.

Suggested implementation path:

1. Add `verification` metadata to lattice packets (`source`, `method`, `confidence`, `measured_at`).
2. Reject packets that fail schema + invariant checks in `apps/server` before broadcast.
3. In `apps/web`, render a "verified" badge only when proof metadata is complete.
4. Add test vectors that intentionally include persuasive-but-invalid numeric claims and assert rejection.

This keeps the system aligned with a simple rule: **if it cannot be derived, it cannot be displayed**.

---

## Deploy

- Vercel: Deploy `apps/web` to Vercel; point `NEXT_PUBLIC_WS_URL` at a publicly accessible WS server (or deploy the server somewhere public as well).
- Heroku / Fly / Render: Deploy `apps/server` as a Node service; expose the WS endpoint and update the web `NEXT_PUBLIC_WS_URL`.

---

## Contributing

- Create a branch, commit changes, open a PR with description and screenshots.
- If you want me to prepare a PR or push these files to GitHub for you, I can generate a zip (already provided) and steps or a script to create the repo and push — or you can run the following locally:

  gh repo create <YOUR_USER>/omega-lattice --public --confirm
  git init
  git add .
  git commit -m "Initial commit: omega-lattice"
  git branch -M main
  git remote add origin https://github.com/<YOUR_USER>/omega-lattice.git
  git push -u origin main

---

## License

MIT — modify as desired.

---

If you want, I can:
- Add a stylized Omega Seal UI and a text command input.
- Convert the WS server into a Next.js API route (single-port Replit-friendly).
- Produce a GitHub Actions workflow to run tests and build the web app.

Which follow-up should I do next?  
- "Seal UI", "API route server", "GitHub push script", or "CI workflow".
