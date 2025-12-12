import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

export default function Hologram() {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef} position={[0, 0, 0]} scale={1.5}>
                <icosahedronGeometry args={[1, 2]} />
                {/* Wireframe inner mesh */}
                <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.3} />

                {/* Glowy outer mesh */}
                <mesh scale={0.9}>
                    <icosahedronGeometry args={[1, 2]} />
                    <MeshDistortMaterial
                        color="#7000ff"
                        emissive="#00f3ff"
                        emissiveIntensity={0.5}
                        roughness={0.1}
                        metalness={1}
                        distort={0.4}
                        speed={2}
                        transparent
                        opacity={0.6}
                    />
                </mesh>
            </mesh>

            {/* Orbital rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.5, 0.02, 16, 100]} />
                <meshBasicMaterial color="#00f3ff" transparent opacity={0.2} />
            </mesh>

            <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[3.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#7000ff" transparent opacity={0.2} />
            </mesh>

        </Float>
    );
}
