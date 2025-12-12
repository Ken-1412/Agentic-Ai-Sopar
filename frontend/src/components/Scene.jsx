import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import Hologram from './Hologram';

export default function Scene() {
    return (
        <div className="scene-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: -1 }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <color attach="background" args={['#030305']} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7000ff" />

                <Suspense fallback={null}>
                    <Hologram />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Suspense>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
}
