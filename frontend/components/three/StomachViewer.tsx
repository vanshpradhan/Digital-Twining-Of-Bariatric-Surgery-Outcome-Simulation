'use client';

import { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface StomachModelProps {
    stressData?: number[];
    showStress: boolean;
    wireframe: boolean;
}

function StomachModel({ stressData, showStress, wireframe }: StomachModelProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Create stomach-like geometry
    const geometry = useMemo(() => {
        const shape = new THREE.Shape();

        // Create stomach profile
        shape.moveTo(0, 0);
        shape.bezierCurveTo(2, 0, 3, 1, 3, 2);  // Fundus
        shape.bezierCurveTo(3, 3, 2, 4, 1.5, 4.5);  // Body
        shape.bezierCurveTo(1, 5, 0.5, 5.5, 0, 5.5);  // Antrum

        const latheGeometry = new THREE.LatheGeometry(
            shape.getPoints(32),
            32,
            0,
            Math.PI * 2
        );

        // Scale and center
        latheGeometry.scale(0.4, 0.4, 0.4);
        latheGeometry.translate(0, -1, 0);

        return latheGeometry;
    }, []);

    // Add vertex colors for stress visualization
    const material = useMemo(() => {
        if (showStress) {
            return new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.6,
                metalness: 0.1,
                wireframe,
            });
        }
        return new THREE.MeshStandardMaterial({
            color: '#ff6b9d',
            roughness: 0.6,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9,
            wireframe,
        });
    }, [showStress, wireframe]);

    // Apply stress colors
    useMemo(() => {
        if (showStress && geometry) {
            const colors = [];
            const count = geometry.attributes.position.count;

            for (let i = 0; i < count; i++) {
                const y = geometry.attributes.position.getY(i);
                // Map y position to stress (demo gradient)
                const stress = (y + 1.5) / 3;

                // Green -> Yellow -> Red gradient
                let r, g, b;
                if (stress < 0.5) {
                    r = stress * 2;
                    g = 1;
                    b = 0;
                } else {
                    r = 1;
                    g = 1 - (stress - 0.5) * 2;
                    b = 0;
                }

                colors.push(r, g, b);
            }

            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        }
    }, [geometry, showStress]);

    // Gentle rotation
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow>
                {/* Region labels */}
                <Html position={[0, 0.8, 0.5]} center>
                    <div className="px-2 py-1 bg-background/80 rounded text-xs whitespace-nowrap">
                        Fundus
                    </div>
                </Html>
                <Html position={[0, 0, 0.7]} center>
                    <div className="px-2 py-1 bg-background/80 rounded text-xs whitespace-nowrap">
                        Body
                    </div>
                </Html>
                <Html position={[0, -0.8, 0.5]} center>
                    <div className="px-2 py-1 bg-background/80 rounded text-xs whitespace-nowrap">
                        Antrum
                    </div>
                </Html>
            </mesh>
        </Float>
    );
}

function StapleLineMesh({ position = [0, 0, 0.5] }: { position?: [number, number, number] }) {
    const geometry = useMemo(() => {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(0, 0.1, 0.1),
            new THREE.Vector3(0.5, 0, 0)
        );
        return new THREE.TubeGeometry(curve, 20, 0.02, 8, false);
    }, []);

    return (
        <mesh geometry={geometry} position={position}>
            <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
        </mesh>
    );
}

interface StomachViewerProps {
    showStress?: boolean;
    showStapleLine?: boolean;
    wireframe?: boolean;
    stressData?: number[];
    className?: string;
}

export default function StomachViewer({
    showStress = false,
    showStapleLine = false,
    wireframe = false,
    stressData,
    className = '',
}: StomachViewerProps) {
    return (
        <div className={`viewer-container ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                shadows
                gl={{ antialias: true }}
            >
                <color attach="background" args={['#0a0a0a']} />

                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#3b82f6" />

                {/* Controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2}
                    maxDistance={10}
                />

                {/* Environment */}
                <Environment preset="night" />

                {/* Models */}
                <Suspense fallback={null}>
                    <StomachModel
                        showStress={showStress}
                        wireframe={wireframe}
                        stressData={stressData}
                    />
                    {showStapleLine && <StapleLineMesh />}
                </Suspense>

                {/* Grid helper */}
                <gridHelper args={[10, 10, '#1e3a5f', '#1e3a5f']} position={[0, -2, 0]} />
            </Canvas>
        </div>
    );
}
