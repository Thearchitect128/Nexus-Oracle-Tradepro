# Sovereign Lattice Integration Manifest

## Overview

This integration introduces a new 96-path Meridian Formal Control Surface experience into the Nexus-Oracle-Tradepro app.

### Deliverables

- `src/pages/vigil/LatticeVizPage.jsx`
- `src/pages/vigil/GrokkojuntuPage.jsx`
- `INTEGRATION_PATCH.md`

## Features

- 96-path lattice rendering across 5 Guardian rings
- Clickable particle nodes with inspector panel
- 10 simulation modes with glassmorphism controls
- Live resonance HUD for the Grokkojuntu bridge
- MFCS mode mapping to lattice simulation task state
- Scroll-friendly page layout and UI layering

## Quick Start

1. Ensure the project has the React Three Fiber stack installed:

```bash
npm install three @react-three/fiber @react-three/drei
```

2. Copy or merge the new pages into your `src/pages/vigil/` directory.
3. Add the route for the lattice page and the enhanced Grokkojuntu page.
4. Restart the development server and visit:
   - `/vigil/lattice-viz`
   - `/vigil/grokkojuntu`

## Notes for Existing App Integration

- Replace the placeholder `useSentinelBridge` logic inside `LatticeVizPage.jsx` with your actual `SentinelContext` state mapper.
- If your route definitions are nested or use a custom router layout, place `LatticeVizPage` and `GrokkojuntuPage` under the vigil route group.
- The `GrokkojuntuPage` file is designed to be a direct enhancement of the interactive Dragon Bridge experience.
