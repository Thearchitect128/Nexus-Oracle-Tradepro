import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

const MODES = {
  resting: {
    guardian: 'Γ₅',
    label: 'Resting',
    description: 'Alpha-dominant idle state.',
    accent: '#7fd3ff',
  },
  task: {
    guardian: 'Γ₂/Γ₃',
    label: 'Task',
    description: 'Frontoparietal engagement with beta/gamma surge.',
    accent: '#ffe57f',
  },
  seizure: {
    guardian: 'All',
    label: 'Seizure',
    description: 'Pathological hypersynchrony across the lattice.',
    accent: '#ff6f6f',
  },
  meditation: {
    guardian: 'Γ₅/Γ₁',
    label: 'Meditation',
    description: 'DMN upregulation with theta-delta coherence.',
    accent: '#b28bff',
  },
  sleep: {
    guardian: 'Γ₄',
    label: 'Sleep',
    description: 'SWR replay bursts with hippocampal gamma.',
    accent: '#5fd9ff',
  },
  'temporal-bleed': {
    guardian: 'Γ₁',
    label: 'Temporal Bleed',
    description: 'Pre-stimulus alpha suppression and drift.',
    accent: '#ffb86b',
  },
  'quantum-collapse': {
    guardian: 'Γ₂',
    label: 'Quantum Collapse',
    description: 'Microtubular T₂ coherence activation.',
    accent: '#8bffb2',
  },
  'biofield-emit': {
    guardian: 'Γ₃',
    label: 'Biofield Emit',
    description: '630 nm biophoton flux emission mode.',
    accent: '#ff7bff',
  },
  'mycelial-couple': {
    guardian: 'Γ₄',
    label: 'Mycelial Couple',
    description: 'Cross-kingdom fungal LFP coupling.',
    accent: '#74ff9c',
  },
  'brain-brain': {
    guardian: 'Γ₅',
    label: 'Brain-Brain',
    description: 'Inter-brain gamma phase-lock mode.',
    accent: '#6f9bff',
  },
};

const RING_COUNTS = [18, 20, 20, 18, 20];
const RING_RADII = [2.2, 3.5, 4.9, 6.3, 7.7];
const GUARDIANS = ['Vigil', 'Shield', 'Lattice', 'Forge', 'Oracle'];
const TRIADS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Theta'];
const HEXAGRAMS = [...Array(64)].map((_, index) => `H${(index + 1).toString(16).padStart(2, '0').toUpperCase()}`);

function buildLatticePaths() {
  const paths = [];
  let id = 1;

  for (let ringIndex = 0; ringIndex < RING_COUNTS.length; ringIndex += 1) {
    const count = RING_COUNTS[ringIndex];
    const radius = RING_RADII[ringIndex];

    for (let localIndex = 0; localIndex < count; localIndex += 1) {
      const phase = (localIndex / count) * Math.PI * 2;
      const x = Math.cos(phase) * radius;
      const y = Math.sin(phase) * radius;
      const guardian = GUARDIANS[ringIndex];
      const hexagram = HEXAGRAMS[id % HEXAGRAMS.length];
      const triad = TRIADS[ringIndex];
      const polarity = id % 2 === 0 ? 'Positive' : 'Negative';

      paths.push({
        id,
        guardian,
        ring: ringIndex + 1,
        position: [x, y, (ringIndex - 2) * 0.5],
        hexagram,
        triad,
        polarity,
        activation: 0.12 + (localIndex / count) * 0.76,
        coherence: 0.4 + (ringIndex / RING_COUNTS.length) * 0.52,
        label: `Path ${id.toString().padStart(2, '0')}`,
        description: `Sovereign lattice channel ${id} in ${guardian} ring.`,
      });

      id += 1;
    }
  }

  return paths;
}

function useSentinelBridge(defaultMode = 'task') {
  const [mfcsMode, setMfcsMode] = useState('ACTIVE');
  const [latticeTask, setLatticeTask] = useState(defaultMode);

  useEffect(() => {
    const mapping = {
      ACTIVE: 'task',
      ALERT: 'seizure',
      IDLE: 'resting',
    };
    setLatticeTask(mapping[mfcsMode] || defaultMode);
  }, [mfcsMode, defaultMode]);

  return { mfcsMode, setMfcsMode, latticeTask };
}

function PathNode({ path, active, onSelect }) {
  const ref = useRef();
  const scale = active ? 1.35 : 1;
  const color = active ? '#ffca67' : '#8cd1ff';

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      ref.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <mesh
      ref={ref}
      position={path.position}
      scale={[scale, scale, scale]}
      onClick={() => onSelect(path.id)}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.25, 14, 14]} />
      <meshStandardMaterial color={color} emissive={active ? '#ffd575' : '#2b6f9c'} metalness={0.55} roughness={0.25} />
      <Html distanceFactor={8} center>
        <div style={{ minWidth: 56, textAlign: 'center', color: '#fff', textShadow: '0 0 12px rgba(0,0,0,0.35)', fontSize: 10 }}>
          {path.id}
        </div>
      </Html>
    </mesh>
  );
}

function LatticeVizScene({ paths, mode, selectedPathId, onSelect }) {
  const activeMap = useMemo(() => {
    const modeInfo = MODES[mode] || MODES.resting;
    return paths.reduce((map, path) => {
      const isGuardianMatch = modeInfo.guardian === 'All' || path.guardian.includes(modeInfo.guardian.replace('/', ''));
      const intensity = isGuardianMatch ? 0.75 + (path.activation * 0.2) : 0.12 + (path.coherence * 0.2);
      map[path.id] = intensity > 0.4;
      return map;
    }, {});
  }, [mode, paths]);

  return (
    <group>
      {paths.map((path) => (
        <PathNode key={path.id} path={path} active={activeMap[path.id] || path.id === selectedPathId} onSelect={onSelect} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.8]}>
        <ringGeometry args={[8.5, 9.1, 128]} />
        <meshBasicMaterial color="rgba(255,255,255,0.05)" side={2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.6]}>
        <ringGeometry args={[6, 6.8, 96]} />
        <meshBasicMaterial color="rgba(255,255,255,0.08)" side={2} />
      </mesh>
    </group>
  );
}

export function LatticeVizView({ startingMode = 'task', compact = false }) {
  const latticePaths = useMemo(buildLatticePaths, []);
  const [mode, setMode] = useState(startingMode);
  const [selectedPathId, setSelectedPathId] = useState(1);
  const selectedPath = latticePaths.find((item) => item.id === selectedPathId) || latticePaths[0];
  const { mfcsMode, setMfcsMode, latticeTask } = useSentinelBridge(mode);

  useEffect(() => {
    setMode(latticeTask);
  }, [latticeTask]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '360px 1fr', minHeight: '100vh', gap: 24, padding: 24, background: 'linear-gradient(180deg, rgba(12,12,24,0.96) 0%, rgba(8,15,39,1) 100%)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 24, borderRadius: 28, background: 'rgba(10, 20, 42, 0.78)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 32px 120px rgba(0,0,0,0.22)' }}>
        {!compact && (
          <>
            <div>
              <p style={{ margin: 0, color: '#88b0ff', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 12 }}>Sovereign Lattice</p>
              <h1 style={{ margin: '8px 0 0', fontSize: 34, lineHeight: 1.05, color: '#fff' }}>96-Path Meridian Formal Control Surface</h1>
            </div>
            <p style={{ margin: 0, color: '#c8d7ff', opacity: 0.84 }}>Explore the 96-path lattice across five Guardian rings. Click any node to inspect its current resonance, activation, and channel coherence.</p>
          </>
        )}

        <div style={{ display: 'grid', gap: 12 }}>
          {Object.entries(MODES).map(([key, modeInfo]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.1)',
                background: key === mode ? `linear-gradient(135deg, ${modeInfo.accent}22, ${modeInfo.accent}11)` : 'rgba(255,255,255,0.04)',
                color: key === mode ? '#fff' : '#c8d7ff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontWeight: 700 }}>{modeInfo.label}</span>
                <span style={{ opacity: 0.75 }}>{modeInfo.guardian}</span>
              </div>
              <span style={{ display: 'block', marginTop: 6, fontSize: 13, opacity: 0.78 }}>{modeInfo.description}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: 20, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#f1f7ff' }}>{selectedPath.label}</h2>
          <p style={{ margin: '10px 0 0', color: '#b9c9ff', opacity: 0.88 }}>{selectedPath.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10, marginTop: 16 }}>
            {[
              ['Guardian', selectedPath.guardian],
              ['Hexagram', selectedPath.hexagram],
              ['Triad', selectedPath.triad],
              ['Polarity', selectedPath.polarity],
              ['Activation', `${Math.round(selectedPath.activation * 100)}%`],
              ['Coherence', `${Math.round(selectedPath.coherence * 100)}%`],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: 12, borderRadius: 18, background: 'rgba(255,255,255,0.04)' }}>
                <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8fb4ff' }}>{label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 15, color: '#fff' }}>{value}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            <div style={{ height: 10, width: '100%', borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: `${Math.round(selectedPath.activation * 100)}%`, height: '100%', borderRadius: 999, background: '#ffcd70' }} />
            </div>
            <div style={{ height: 10, width: '100%', borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{ width: `${Math.round(selectedPath.coherence * 100)}%`, height: '100%', borderRadius: 999, background: '#7ac1ff' }} />
            </div>
          </div>
          <div style={{ marginTop: 18, fontSize: 13, color: '#99b4ff' }}>
            MFCS mode currently mapped to lattice simulation task <strong style={{ color: '#fff' }}>{mfcsMode}</strong> → <strong style={{ color: '#fff' }}>{mode}</strong>.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['ACTIVE', 'ALERT', 'IDLE'].map((state) => (
              <button
                type="button"
                key={state}
                onClick={() => setMfcsMode(state)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: mfcsMode === state ? '#3a6eff' : 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderRadius: 32, overflow: 'hidden', position: 'relative', minHeight: compact ? '720px' : '820px', boxShadow: '0 60px 140px rgba(0,0,0,0.45)' }}>
        <Canvas camera={{ position: [0, 0, 24], fov: 40 }} style={{ width: '100%', height: '100%' }}>
          <color attach="background" args={['#060b18']} />
          <ambientLight intensity={0.65} />
          <pointLight position={[18, 22, 16]} intensity={1.2} color="#d6e3ff" />
          <pointLight position={[-16, -12, 8]} intensity={0.65} color="#6fb3ff" />
          <LatticeVizScene paths={latticePaths} mode={mode} selectedPathId={selectedPathId} onSelect={setSelectedPathId} />
          <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
        <div style={{ position: 'absolute', left: 24, top: 24, background: 'rgba(1,11,28,0.9)', padding: '14px 18px', borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)', color: '#eef2ff', fontSize: 13, maxWidth: 240 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Active Lattice Flow</div>
          <div style={{ lineHeight: 1.5, opacity: 0.9 }}>Guardian ring <strong>{selectedPath.guardian}</strong> is currently receiving the strongest resonance signature in the {mode} simulation mode.</div>
        </div>
      </div>
    </div>
  );
}

export default function LatticeVizPage() {
  return <LatticeVizView startingMode="task" compact={false} />;
}
