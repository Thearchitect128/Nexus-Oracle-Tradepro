#!/usr/bin/env bash
set -e
ROOT="omega-lattice"
rm -rf "$ROOT"
mkdir -p "$ROOT"

cat > "$ROOT/package.json" <<'EOF'
{
  "name": "omega-lattice",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:server": "pnpm --filter server dev",
    "dev:web": "pnpm --filter web dev",
    "dev": "concurrently \"pnpm dev:server\" \"pnpm dev:web\""
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "typescript": "^5.6.0"
  },
  "packageManager": "pnpm@9.0.0"
}
EOF

cat > "$ROOT/tsconfig.json" <<'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@omega/engine": ["packages/engine/lattice.ts"],
      "@omega/types": ["packages/types/index.ts"]
    }
  }
}
EOF

mkdir -p "$ROOT/packages/engine"
cat > "$ROOT/packages/engine/package.json" <<'EOF'
{
  "name": "@omega/engine",
  "version": "1.0.0",
  "main": "lattice.ts",
  "types": "lattice.ts"
}
EOF

cat > "$ROOT/packages/engine/lattice.ts" <<'EOF'
export type NodeState = {
  id: string
  state: "active" | "staged" | "monitor" | "sealed"
  energy: number
  links: string[]
}

export type LatticeState = {
  nodes: Record<string, NodeState>
  resonance: number
  phiSync: number
  polarity: number
  tick: number
}

export function createLattice(size = 96): LatticeState {
  const nodes: Record<string, NodeState> = {}
  for (let i = 0; i < size; i++) {
    nodes[`n${i}`] = {
      id: `n${i}`,
      state: "active",
      energy: Math.random(),
      links: []
    }
  }
  return {
    nodes,
    resonance: 0.5,
    phiSync: 0.618,
    polarity: 0,
    tick: 0
  }
}

export function step(state: LatticeState): LatticeState {
  const next: LatticeState = JSON.parse(JSON.stringify(state))
  const values = Object.values(next.nodes)
  values.forEach(node => {
    const drift = (Math.random() - 0.5) * 0.05
    node.energy = Math.max(0, Math.min(1, node.energy + drift))
    if (node.energy > 0.8) node.state = "active"
    else if (node.energy > 0.5) node.state = "staged"
    else if (node.energy > 0.2) node.state = "monitor"
    else node.state = "sealed"
  })
  next.resonance = values.reduce((a, n) => a + n.energy, 0) / values.length
  next.tick++
  return next
}
EOF

mkdir -p "$ROOT/packages/types"
cat > "$ROOT/packages/types/package.json" <<'EOF'
{
  "name": "@omega/types",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts"
}
EOF

cat > "$ROOT/packages/types/index.ts" <<'EOF'
export type { NodeState, LatticeState } from "@omega/engine"
EOF

mkdir -p "$ROOT/apps/server"
cat > "$ROOT/apps/server/package.json" <<'EOF'
{
  "name": "server",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node index.ts"
  },
  "dependencies": {
    "@omega/engine": "1.0.0",
    "ws": "^8.18.0",
    "ts-node": "^10.9.2"
  }
}
EOF

cat > "$ROOT/apps/server/index.ts" <<'EOF'
import { WebSocketServer } from "ws"
import { createLattice, step } from "@omega/engine"

const PORT = Number(process.env.PORT || 3001)
const wss = new WebSocketServer({ port: PORT })

let state = createLattice()
let history: string[] = []

setInterval(() => {
  history.push(JSON.stringify(state))
  if (history.length > 50) history.shift()

  state = step(state)
  const payload = JSON.stringify(state)

  wss.clients.forEach(client => {
    // @ts-ignore
    if (client.readyState === 1) client.send(payload)
  })
}, 618)

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString())
      if (data.type === "intent" && data.payload === "stabilize") {
        Object.values(state.nodes).forEach(n => (n.energy *= 0.9))
      }
    } catch (e) {
      // ignore
    }
  })
})

console.log(`Omega Lattice server running on ws://localhost:${PORT}`)
EOF

mkdir -p "$ROOT/apps/web/src/pages"
mkdir -p "$ROOT/apps/web/src/components"
mkdir -p "$ROOT/apps/web/src/hooks"
cat > "$ROOT/apps/web/package.json" <<'EOF'
{
  "name": "web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 3000"
  },
  "dependencies": {
    "@omega/types": "1.0.0",
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.170.0",
    "zustand": "^5.0.0"
  }
}
EOF

cat > "$ROOT/apps/web/next.config.mjs" <<'EOF'
const nextConfig = {
  reactStrictMode: false
}
export default nextConfig
EOF

cat > "$ROOT/apps/web/src/store.ts" <<'EOF'
import { create } from "zustand"
import type { LatticeState } from "@omega/types"

export const useLattice = create<{
  state: LatticeState | null
  setState: (s: LatticeState) => void
}>((set) => ({
  state: null,
  setState: (s) => set({ state: s })
}))
EOF

cat > "$ROOT/apps/web/src/hooks/useLatticeSync.ts" <<'EOF'
import { useEffect } from "react"
import { useLattice } from "../store"

export function useLatticeSync() {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001"
    const ws = new WebSocket(url)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      useLattice.getState().setState(data)
    }
    ws.onopen = () => {
      // connection ready
    }
    ws.onerror = () => {
      // ignore for now
    }
    return () => ws.close()
  }, [])
}
EOF

cat > "$ROOT/apps/web/src/components/Lattice3D.tsx" <<'EOF'
import * as THREE from "three"
import { useEffect, useRef } from "react"
import { useLattice } from "../store"

export default function Lattice3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const { state } = useLattice()

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    mountRef.current.appendChild(renderer.domElement)

    camera.position.z = 5

    const nodes: THREE.Mesh[] = []

    function createNodes() {
      if (!state) return
      const values = Object.values(state.nodes)
      values.forEach((node, i) => {
        const geo = new THREE.SphereGeometry(0.04)
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
        const mesh = new THREE.Mesh(geo, mat)
        const angle = (i / values.length) * Math.PI * 2
        mesh.position.set(
          Math.cos(angle) * 2,
          Math.sin(angle) * 2,
          (node.energy - 0.5) * 2
        )
        scene.add(mesh)
        nodes.push(mesh)
      })
    }

    createNodes()

    function animate() {
      requestAnimationFrame(animate)
      nodes.forEach(n => {
        n.rotation.x += 0.001
        n.rotation.y += 0.001
      })
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      renderer.dispose()
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [state])

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
}
EOF

cat > "$ROOT/apps/web/src/pages/index.tsx" <<'EOF'
import { useLatticeSync } from "../hooks/useLatticeSync"
import Lattice3D from "../components/Lattice3D"
import { useLattice } from "../store"

export default function Home() {
  useLatticeSync()
  const { state } = useLattice()

  return (
    <div style={{ background: "#05070d", color: "#00ffff" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <h1>OMEGA LATTICE</h1>
        <p>Tick: {state?.tick ?? "--"}</p>
        <p>Resonance: {state?.resonance?.toFixed?.(3) ?? "--"}</p>
      </div>
      <Lattice3D />
    </div>
  )
}
EOF

cat > "$ROOT/.replit" <<'EOF'
run = "bash -lc 'pnpm install && pnpm dev'"
EOF

echo "Creating zip archive..."
( cd "$(dirname "$ROOT")" || exit 1
  zip -r "omega-lattice.zip" "$(basename "$ROOT")" > /dev/null
)

echo "Done: omega-lattice.zip"
echo "To inspect: unzip -l omega-lattice.zip"
