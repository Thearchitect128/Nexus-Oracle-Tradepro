# Integration Patch — Sovereign Lattice

This patch adds the new Sovereign Lattice 96-path visualization and the Grokkojuntu Dragon Bridge wrapper.

## Files Added

- `src/pages/vigil/LatticeVizPage.jsx`
- `src/pages/vigil/GrokkojuntuPage.jsx`

## What Was Added

1. **New route candidate**: `LatticeVizPage` delivers a full 96-path lattice visualization.
2. **Enhanced Grokkojuntu route**: `GrokkojuntuPage` wraps the lattice with a live resonance HUD and bridge status panel.
3. **MFCS state bridge simulation**: built-in mapping from MFCS modes (`ACTIVE`, `ALERT`, `IDLE`) into lattice simulation modes.
4. **Glassmorphism UI**: layered translucent panels, blur/glow, and scroll-safe page layout.

## Suggested Router Wiring

If your app uses React Router inside a `vigil` route group, add:

```jsx
import LatticeVizPage from './pages/vigil/LatticeVizPage';
import GrokkojuntuPage from './pages/vigil/GrokkojuntuPage';

<Route path="vigil">
  <Route path="lattice-viz" element={<LatticeVizPage />} />
  <Route path="grokkojuntu" element={<GrokkojuntuPage />} />
</Route>
```

## Suggested Navigation Link

Add a navigation link to the vigil menu:

```js
{ path: '/vigil/lattice-viz', label: 'LATTICE VIZ' }
```

## Dependency Checklist

This integration assumes the project includes or installs:

- `three`
- `@react-three/fiber`
- `@react-three/drei`

If the project uses a different R3F wrapper or a custom control layer, adjust the import and camera code accordingly.

## Scrollable Page Fix

If you have a global `body` or `html` overflow rule, ensure page scrolling is enabled:

```css
html, body, #root {
  min-height: 100%;
  overflow-x: hidden;
}
```

## Notes

- The `LatticeVizPage` and `GrokkojuntuPage` files are self-contained and can be adapted into the existing MFCS Core layout.
- If `SentinelContext` exists in your app, replace the `useSentinelBridge` stub inside `LatticeVizPage.jsx` with the live context hook.
