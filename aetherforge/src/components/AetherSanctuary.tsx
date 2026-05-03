import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAetherStore, Archetype } from '../store';

const symbols: Record<Archetype, { emoji: string; color: string; pos: [number, number, number] }> = {
  lion:      { emoji: '🦁', color: '#fbbf24', pos: [-11, 7, 0] },
  dragon:    { emoji: '🐉', color: '#6366f1', pos: [-7, 10, -9] },
  phoenix:   { emoji: '🐦‍🔥', color: '#f97316', pos: [0, 12, -12] },
  butterfly: { emoji: '🦋', color: '#c026d3', pos: [7, 10, -9] },
  raven:     { emoji: '🐦‍⬛', color: '#64748b', pos: [11, 7, 0] },
  rabbit:    { emoji: '🐇', color: '#22d3ee', pos: [8, 5, 9] },
  om:        { emoji: '🕉️', color: '#a5b4fc', pos: [-8, 5, 9] },
  mirror:    { emoji: '🪞', color: '#e0f2fe', pos: [0, 4, 13] },
};

function ArchetypePortal({ arch }: { arch: Archetype }) {
  const { emoji, color, pos } = symbols[arch];
  const groupRef = useRef<THREE.Group>(null!);
  const { archetypeEnergies, setActiveArchetype } = useAetherStore();
  const energy = archetypeEnergies[arch];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * (0.15 + energy / 300);
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.08 * (energy / 80);
      groupRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      <mesh
        onClick={() => setActiveArchetype(arch)}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <sphereGeometry args={[1.9]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7 + energy / 180}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      <Html position={[0, 4.2, 0]} center>
        <div className="text-5xl drop-shadow-[0_0_20px_rgb(165,180,252)] pointer-events-none">
          {emoji}
        </div>
      </Html>
    </group>
  );
}

export function AetherSanctuary() {
  const { auraLevel } = useAetherStore();

  return (
    <>
      {/* Central Om Mandala Core */}
      <group position={[0, 6.5, 0]}>
        <mesh>
          <torusGeometry args={[5.2, 0.75, 18, 120]} />
          <meshStandardMaterial
            color="#c4b5fd"
            emissive="#a5b4fc"
            emissiveIntensity={1.2 + auraLevel * 0.2}
          />
        </mesh>
        <Html position={[0, 7, 0]} center>
          <div className="text-7xl opacity-90 drop-shadow-2xl">🕉️</div>
        </Html>
      </group>

      {/* All Archetypes */}
      {(Object.keys(symbols) as Archetype[]).map((arch) => (
        <ArchetypePortal key={arch} arch={arch} />
      ))}

      {/* Trident Accent near Lion */}
      <Html position={[-13, 11, 2]} center>
        <div className="text-4xl">🔱</div>
      </Html>

      {/* Mirror Floor */}
      <mesh rotation={[-Math.PI * 0.48, 0, 0]} position={[0, 0.2, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={0.8}
        />
      </mesh>
    </>
  );
}
