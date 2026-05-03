import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { Suspense } from 'react';
import { AetherSanctuary } from './components/AetherSanctuary';
import ControlPanel from './components/ControlPanel';
import './index.css';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Canvas
        camera={{ position: [0, 12, 26], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <pointLight position={[10, 20, 10]} color="#c4b5fd" intensity={2.5} />

          <AetherSanctuary />

          <Environment preset="night" />
          <Stars radius={400} depth={80} count={1500} factor={4} />
        </Suspense>

        <OrbitControls 
          enablePan={false}
          minDistance={10}
          maxDistance={45}
          target={[0, 6, 0]}
          autoRotate={false}
        />
      </Canvas>

      <ControlPanel />
    </div>
  );
}

export default App;
