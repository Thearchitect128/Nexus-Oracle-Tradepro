import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { HARMONIC_SHELLS, clamp, complexityToLevel, getFieldDrive } from "../../lib/frequency-map";

interface LatticeNodesProps {
  hue?: number;
  speed?: number;
  complexity?: number;
  frequency?: number;
}

interface VisualNode {
  index: number;
  shellIndex: number;
  shell: (typeof HARMONIC_SHELLS)[number];
  basePosition: THREE.Vector3;
  currentPosition: THREE.Vector3;
  baseColor: THREE.Color;
  amplitude: number;
  phaseOffset: number;
}

interface VisualEdge {
  start: number;
  end: number;
  weight: number;
}

function fibonacciPoint(index: number, total: number, radius: number) {
  if (total <= 1 || radius === 0) {
    return new THREE.Vector3(0, 0, 0);
  }

  const offset = 2 / total;
  const increment = Math.PI * (3 - Math.sqrt(5));
  const y = index * offset - 1 + offset / 2;
  const radial = Math.sqrt(Math.max(0, 1 - y * y));
  const phi = index * increment;

  return new THREE.Vector3(
    Math.cos(phi) * radial * radius,
    y * radius,
    Math.sin(phi) * radial * radius
  );
}

function buildEdgeList(nodes: VisualNode[]) {
  const shellGroups = new Map<number, number[]>();
  const edges: VisualEdge[] = [];

  nodes.forEach((node, index) => {
    const group = shellGroups.get(node.shellIndex) ?? [];
    group.push(index);
    shellGroups.set(node.shellIndex, group);
  });

  for (let shellIndex = 0; shellIndex < HARMONIC_SHELLS.length; shellIndex += 1) {
    const group = shellGroups.get(shellIndex) ?? [];
    const previous = shellGroups.get(shellIndex - 1) ?? [];

    if (group.length > 1) {
      group.forEach((nodeIndex, index) => {
        edges.push({
          start: nodeIndex,
          end: group[(index + 1) % group.length],
          weight: 0.55,
        });
      });
    }

    if (previous.length > 0) {
      group.forEach((nodeIndex, index) => {
        const previousIndex = previous[Math.floor((index / Math.max(group.length - 1, 1)) * (previous.length - 1))];
        edges.push({
          start: previousIndex,
          end: nodeIndex,
          weight: 1,
        });
      });
    }
  }

  return edges;
}

export function LatticeNodes({ hue = 170, speed = 1.0, complexity = 1.0, frequency = 1.0 }: LatticeNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const dummyRef = useRef(new THREE.Object3D());
  const tempColorRef = useRef(new THREE.Color());
  const accentColor = useMemo(() => new THREE.Color(`hsl(${hue}, 90%, 62%)`), [hue]);

  const densityLevel = useMemo(() => complexityToLevel(complexity), [complexity]);

  const nodes = useMemo(() => {
    const nextNodes: VisualNode[] = [];
    let globalIndex = 0;

    HARMONIC_SHELLS.forEach((shell, shellIndex) => {
      const count = shell.role === "core" ? 1 : shell.baseNodes * densityLevel;
      const radius = shell.radius * 3.6;
      const baseColor =
        shell.role === "core"
          ? new THREE.Color("#f2fbff")
          : shell.role === "mirror"
            ? new THREE.Color("#93ecff")
            : shell.role === "triad"
              ? new THREE.Color("#5eb4ff")
              : shell.role === "envelope"
                ? new THREE.Color("#75ffe0")
                : shell.role === "telemetry"
                  ? new THREE.Color("#6e8cff")
                  : new THREE.Color("#20316b");

      for (let index = 0; index < count; index += 1) {
        nextNodes.push({
          index: globalIndex,
          shellIndex,
          shell,
          basePosition: fibonacciPoint(index, count, radius),
          currentPosition: fibonacciPoint(index, count, radius),
          baseColor,
          amplitude: clamp(1 - shellIndex * 0.12, 0.35, 1),
          phaseOffset: index * 0.41 + shell.harmonic * 0.35,
        });
        globalIndex += 1;
      }
    });

    return nextNodes;
  }, [densityLevel]);

  const edges = useMemo(() => buildEdgeList(nodes), [nodes]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    return geometry;
  }, [edges.length]);

  useFrame((state) => {
    if (!meshRef.current) {
      return;
    }

    const dummy = dummyRef.current;
    const tempColor = tempColorRef.current;
    const drive = getFieldDrive(frequency);
    const time = state.clock.elapsedTime * clamp(speed, 0.25, 2.5);
    const positions = lineRef.current?.geometry.attributes.position.array as Float32Array | undefined;

    nodes.forEach((node, index) => {
      const shellRate = drive * (0.13 + node.shell.harmonic * 0.032);
      const wave = Math.sin(time * shellRate + node.phaseOffset);
      const spiral = time * 0.034 * drive * (0.3 + node.shell.harmonic * 0.08);
      const cos = Math.cos(spiral + node.phaseOffset * 0.05);
      const sin = Math.sin(spiral + node.phaseOffset * 0.05);
      const radialScale = 1 + wave * (0.024 + node.shellIndex * 0.006) * node.amplitude;

      const baseX = node.basePosition.x;
      const baseY = node.basePosition.y;
      const baseZ = node.basePosition.z;

      const x = (baseX * cos - baseZ * sin) * radialScale;
      const z = (baseX * sin + baseZ * cos) * radialScale;
      const y = baseY * (1 + wave * 0.05 * node.amplitude);

      node.currentPosition.set(x, y, z);

      dummy.position.copy(node.currentPosition);
      dummy.scale.setScalar(
        node.shell.role === "core"
          ? 0.54 + wave * 0.05 + drive * 0.025
          : 0.085 + node.amplitude * 0.045 + drive * 0.01
      );
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(index, dummy.matrix);

      tempColor.copy(node.baseColor).lerp(accentColor, 0.08 + node.shellIndex * 0.05);
      tempColor.offsetHSL(0, 0, wave * 0.02);
      meshRef.current.setColorAt(index, tempColor);
    });

    if (positions && lineRef.current) {
      let cursor = 0;
      edges.forEach((edge) => {
        const start = nodes[edge.start].currentPosition;
        const end = nodes[edge.end].currentPosition;

        positions[cursor++] = start.x;
        positions[cursor++] = start.y;
        positions[cursor++] = start.z;
        positions[cursor++] = end.x;
        positions[cursor++] = end.y;
        positions[cursor++] = end.z;
      });
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <mesh scale={4.2}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#1236a5" transparent opacity={0.018} depthWrite={false} />
      </mesh>
      <mesh scale={8.4}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#19b2ff" transparent opacity={0.015} depthWrite={false} />
      </mesh>
      <mesh scale={13}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#7df5ff" transparent opacity={0.012} depthWrite={false} />
      </mesh>

      <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial vertexColors transparent opacity={0.94} />
      </instancedMesh>

      <lineSegments ref={lineRef}>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial color={accentColor} transparent opacity={0.12} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
}
