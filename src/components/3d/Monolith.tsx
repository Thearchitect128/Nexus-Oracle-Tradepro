import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export function Monolith() {
  const groupRef = useRef<THREE.Group>(null);
  const cubeGeometry = useMemo(() => new THREE.BoxGeometry(5.8, 5.8, 5.8, 5, 5, 5), []);
  const icosaGeometry = useMemo(() => new THREE.IcosahedronGeometry(2.35, 1), []);
  const cubeEdges = useMemo(() => new THREE.EdgesGeometry(cubeGeometry), [cubeGeometry]);
  const icosaEdges = useMemo(() => new THREE.EdgesGeometry(icosaGeometry), [icosaGeometry]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, -0.15, -7.5]}>
      <lineSegments geometry={cubeEdges}>
        <lineBasicMaterial color="#74e9ff" transparent opacity={0.18} />
      </lineSegments>

      <lineSegments geometry={icosaEdges} rotation={[0.35, 0.2, 0]}>
        <lineBasicMaterial color="#c7fbff" transparent opacity={0.28} />
      </lineSegments>

      <mesh>
        <icosahedronGeometry args={[1.65, 0]} />
        <meshStandardMaterial
          color="#071322"
          emissive="#4dd8ff"
          emissiveIntensity={0.22}
          roughness={0.24}
          metalness={0.74}
          flatShading
          transparent
          opacity={0.72}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.45, 0.03, 14, 180]} />
        <meshBasicMaterial color="#90f3ff" transparent opacity={0.18} />
      </mesh>

      <mesh rotation={[0.4, 0.7, 0.2]}>
        <torusGeometry args={[2.35, 0.02, 12, 140]} />
        <meshBasicMaterial color="#5f8bff" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}
