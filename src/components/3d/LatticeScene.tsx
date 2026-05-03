import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useState } from "react";
import { InterferenceField } from "./InterferenceField";
import { LatticeNodes } from "./LatticeNodes";
import { Monolith } from "./Monolith";

interface LatticeSceneProps {
  hue?: number;
  speed?: number;
  complexity?: number;
  frequency?: number;
}

export function LatticeScene({ hue, speed, complexity, frequency }: LatticeSceneProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const accentHue = hue ?? 170;

  return (
    <div className="absolute inset-0 z-0">
      <Canvas gl={{ preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 2.5, 17]} fov={58} />
        <OrbitControls
          enableZoom
          enablePan
          enableRotate
          enableDamping
          autoRotate={autoRotate}
          autoRotateSpeed={(speed ?? 1) * 0.2}
          onStart={() => setAutoRotate(false)}
        />

        <color attach="background" args={["#020611"]} />
        <fog attach="fog" args={["#020611", 18, 54]} />

        <ambientLight intensity={0.18} />
        <pointLight position={[0, 0.5, 2]} intensity={2.8} distance={16} color="#8fe9ff" />
        <pointLight position={[8, 8, 9]} intensity={0.75} color={`hsl(${accentHue}, 100%, 60%)`} />
        <pointLight position={[-10, 7, -12]} intensity={0.9} color="#275dff" />
        <pointLight position={[0, -6, 10]} intensity={0.55} color="#9af8ff" />
        <gridHelper args={[44, 32, "#124b6a", "#082132"]} position={[0, -7.8, 0]} />

        <InterferenceField hue={hue} speed={speed} complexity={complexity} frequency={frequency} />
        <LatticeNodes hue={hue} speed={speed} complexity={complexity} frequency={frequency} />
        <Monolith />

        <EffectComposer>
          <Bloom intensity={1.35} luminanceThreshold={0.24} luminanceSmoothing={0.92} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
