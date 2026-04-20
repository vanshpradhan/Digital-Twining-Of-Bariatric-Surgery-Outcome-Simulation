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
    const material = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: showStress ? 0.42 : 0.56,
                metalness: showStress ? 0.08 : 0.12,
                wireframe,
                emissive: new THREE.Color(showStress ? '#260808' : '#1a0b05'),
                emissiveIntensity: showStress ? 0.22 : 0.12,
            }),
        [showStress, wireframe]
    );

    // Apply procedural region colors. Stress mode uses full green->yellow->red scale,
    // default mode starts warmer so it resembles clinical heat overlays.
    useMemo(() => {
        if (geometry) {
            const colors = [];
            const count = geometry.attributes.position.count;

            for (let i = 0; i < count; i++) {
                const y = geometry.attributes.position.getY(i);
                const normalized = THREE.MathUtils.clamp((y + 1.5) / 3, 0, 1);

                let r: number;
                let g: number;
                let b: number;

                if (showStress) {
                    if (normalized < 0.5) {
                        r = normalized * 2;
                        g = 1;
                        b = 0;
                    } else {
                        r = 1;
                        g = 1 - (normalized - 0.5) * 2;
                        b = 0;
                    }
                } else {
                    const warm = THREE.MathUtils.lerp(0.15, 1, normalized);
                    r = 1;
                    g = THREE.MathUtils.lerp(0.58, 0.83, 1 - warm);
                    b = THREE.MathUtils.lerp(0.05, 0.12, 1 - warm);
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
                    <div className="whitespace-nowrap border border-white/20 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#f5e7d0]">
                        Fundus
                    </div>
                </Html>
                <Html position={[0, 0, 0.7]} center>
                    <div className="whitespace-nowrap border border-white/20 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#f5e7d0]">
                        Body
                    </div>
                </Html>
                <Html position={[0, -0.8, 0.5]} center>
                    <div className="whitespace-nowrap border border-white/20 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#f5e7d0]">
                        Antrum
                    </div>
                </Html>
                <Html position={[0.45, -0.35, 0.35]} center>
                    <div className="whitespace-nowrap border border-white/20 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#f5e7d0]">
                        Pylorus
                    </div>
                </Html>
                <Html position={[-0.3, 1.1, 0.4]} center>
                    <div className="whitespace-nowrap border border-white/20 bg-black/80 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#f5e7d0]">
                        EG Junction
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
                camera={{ position: [0.2, 0.3, 5.2], fov: 42 }}
                shadows
                gl={{ antialias: true }}
            >
                <color attach="background" args={['#0a0a0a']} />

                {/* Lighting */}
                <ambientLight intensity={0.45} />
                <directionalLight
                    position={[5, 4, 5]}
                    intensity={1.15}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />
                <pointLight position={[-5, 5, -5]} intensity={0.25} color="#3b82f6" />
                <pointLight position={[1, -2, 3]} intensity={0.45} color="#f97316" />

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
                <gridHelper args={[12, 12, '#17315a', '#17315a']} position={[0, -2, 0]} />
            </Canvas>
        </div>
    );
}
