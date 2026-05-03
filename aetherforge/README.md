# AetherForge

**Deep work sanctuary with the 6 Omega Operators, reimagined as a 3D mystical space.**

A fusion of FocusFlow (your Pomodoro timer) and a React Three Fiber 3D environment featuring 8 archetypal symbols that pulse with energy based on your focus sessions.

## Quick Start

```bash
cd aetherforge
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## What You Get

- 🔱 **3D Sanctuary**: React Three Fiber scene with 8 orbiting archetypes
- ⏱️ **FocusFlow Timer**: Full Pomodoro with Focus/Short/Long breaks
- 🦁 **8 Archetypes**: Lion, Dragon, Phoenix, Raven, Butterfly, Rabbit, Om, Mirror
- ✨ **Energy System**: Each archetype has energy that grows as you gain XP
- 🎮 **Zustand State**: Global state management for XP, streaks, sessions
- 🎨 **Glassmorphism UI**: Frosted glass control panel with Tailwind styling

## Architecture

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Canvas setup + component composition
├── index.css                   # Tailwind + global styles
├── store.ts                    # Zustand state (XP, streaks, energy)
└── components/
    ├── AetherSanctuary.tsx     # 3D scene with archetypes
    └── ControlPanel.tsx        # Timer + stats UI
```

## How It Works

1. **Start a focus session** using the control panel timer
2. **Complete it** → +50 XP to Lion archetype
3. **Watch the archetypes glow** as their energy increases
4. **Build your streak** → unlock higher aura levels
5. **Click any archetype** to set it as active (visual feedback in future versions)

## Features

- ✅ Fully functional Pomodoro timer (Focus/5min/15min modes)
- ✅ Real-time XP and streak tracking
- ✅ Aura level that scales with XP (1 level per 180 XP)
- ✅ Archetype energy visualization (rotation speed, glow intensity)
- ✅ Glassmorphism UI with Tailwind
- ✅ Responsive 3D camera with OrbitControls
- ✅ Toast notifications on session completion

## Extending It

### Add Ambient Sounds
```tsx
// In ControlPanel, useEffect for soundscape toggle
const toggleSound = (type: 'rain' | 'cafe' | 'brown') => {
  // Use Web Audio API like in pomodoro-timer.html
}
```

### Add Tasks List
```tsx
// Create src/components/TasksPanel.tsx
// Track per-archetype tasks, link to their energy
```

### Breathing Ritual (Butterfly)
```tsx
// Animate the butterfly + guide breathing cycles
// 4-7-8 breathing: inhale 4, hold 7, exhale 8
```

### Journal (Mirror)
```tsx
// Text input for daily reflections
// Save to localStorage with date
```

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing-fast dev/build
- **Three.js** + **React Three Fiber** for 3D
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Framer Motion** (imported, ready for animations)

## Browser Support

Works on all modern browsers with WebGL support (Chrome, Firefox, Safari 15+, Edge).

## Performance

- 🚀 ~60 FPS on desktop with 8 archetypes
- 🎯 <1.5MB bundle size (unoptimized)
- ⚡ ~2s cold start, instant hot reload with Vite

---

**Next Steps**: Add tasks system, ambient sounds, breathing rituals, or journaling to expand the sanctuary. 

Enjoy forging. 🔱🐉🦁🦋
