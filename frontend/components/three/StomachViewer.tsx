'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import AnatomicalStomachModel from './AnatomicalStomachModel';

/* ───────────────────────────────────────────────
   Staple-line path per surgery type
   ─────────────────────────────────────────────── */

function SleeveStapleLine() {
    const geometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.18, 3.0, 0.32),
            new THREE.Vector3(0.0, 2.4, 0.38),
            new THREE.Vector3(-0.18, 1.6, 0.42),
            new THREE.Vector3(-0.22, 0.8, 0.44),
            new THREE.Vector3(-0.15, 0.0, 0.42),
            new THREE.Vector3(0.0, -0.6, 0.36),
            new THREE.Vector3(0.2, -1.2, 0.28),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 120, 0.018, 12, false);
    }, []);

    const dotGeometry = useMemo(() => new THREE.SphereGeometry(0.028, 8, 8), []);
    const dotPositions = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.18, 3.0, 0.32),
            new THREE.Vector3(0.0, 2.4, 0.38),
            new THREE.Vector3(-0.18, 1.6, 0.42),
            new THREE.Vector3(-0.22, 0.8, 0.44),
            new THREE.Vector3(-0.15, 0.0, 0.42),
            new THREE.Vector3(0.0, -0.6, 0.36),
            new THREE.Vector3(0.2, -1.2, 0.28),
        ], false, 'catmullrom', 0.5);
        return curve.getPoints(18);
    }, []);

    return (
        <group position={[-0.1, -0.05, 0]}>
            <mesh geometry={geometry}>
                <meshBasicMaterial color="#7cb8ff" transparent opacity={0.7} />
            </mesh>
            {dotPositions.map((pos, i) => (
                <mesh key={i} geometry={dotGeometry} position={pos}>
                    <meshBasicMaterial color="#a8d4ff" />
                </mesh>
            ))}
        </group>
    );
}

function BypassStapleLine() {
    const pouchLine = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.15, 2.8, 0.32),
            new THREE.Vector3(-0.05, 2.3, 0.38),
            new THREE.Vector3(-0.15, 1.9, 0.4),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 60, 0.02, 12, false);
    }, []);

    const rouxLimb = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.15, 1.9, 0.4),
            new THREE.Vector3(0.4, 1.6, 0.3),
            new THREE.Vector3(1.0, 1.2, 0.1),
            new THREE.Vector3(1.4, 0.6, -0.05),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 80, 0.015, 12, false);
    }, []);

    return (
        <group position={[-0.1, -0.05, 0]}>
            <mesh geometry={pouchLine}>
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
            </mesh>
            <mesh geometry={rouxLimb}>
                <meshBasicMaterial color="#34d399" transparent opacity={0.6} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   Surgical stapler instrument (proper shape)
   ─────────────────────────────────────────────── */

function StaplerInstrument({ staplerColor }: { staplerColor: string }) {
    return (
        <group position={[1.6, -0.5, 0.15]} rotation={[0.1, -0.3, 0.35]} scale={0.85}>
            {/* Main shaft */}
            <mesh castShadow>
                <cylinderGeometry args={[0.04, 0.04, 1.8, 12]} />
                <meshStandardMaterial color="#2a2d33" metalness={0.85} roughness={0.2} />
            </mesh>
            {/* Jaw top */}
            <mesh position={[0, 0.95, 0]} castShadow>
                <boxGeometry args={[0.12, 0.22, 0.08]} />
                <meshStandardMaterial color={staplerColor} metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Jaw bottom */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[0.12, 0.18, 0.08]} />
                <meshStandardMaterial color="#3a3d44" metalness={0.75} roughness={0.25} />
            </mesh>
            {/* Handle grip */}
            <mesh position={[0, -0.7, 0.08]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.08, 0.5, 0.06]} />
                <meshStandardMaterial color="#1a1c20" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Trigger */}
            <mesh position={[0, -0.5, 0.14]} rotation={[0.5, 0, 0]} castShadow>
                <boxGeometry args={[0.04, 0.25, 0.03]} />
                <meshStandardMaterial color="#555" metalness={0.7} roughness={0.3} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   Viewer
   ─────────────────────────────────────────────── */

interface StomachViewerProps {
    showStress?: boolean;
    showThickness?: boolean;
    showStapleLine?: boolean;
    wireframe?: boolean;
    stressData?: number[];
    highlightedRegion?: number | null;
    onRegionClick?: (id: number) => void;
    surgeryType?: string;
    staplerColor?: string;
    className?: string;
}

export default function StomachViewer({
    showStress = false,
    showThickness = false,
    showStapleLine = false,
    wireframe = false,
    stressData,
    highlightedRegion = null,
    onRegionClick,
    surgeryType = 'sleeve',
    staplerColor = '#60a5fa',
    className = '',
}: StomachViewerProps) {
    return (
        <div className={`viewer-container ${className}`} style={{ width: '100%', height: '100%' }}>
            <Canvas
                camera={{ position: [0, 0, 5.5], fov: 40 }}
                shadows
                gl={{ antialias: true }}
            >
                <color attach="background" args={['#0a0b0e']} />

                <ambientLight intensity={0.18} />
                <hemisphereLight color="#f4c9c3" groundColor="#1b1212" intensity={0.34} />
                <directionalLight position={[4.5, 6, 5.5]} intensity={1.4} color="#ffe1dc" castShadow />
                <pointLight position={[-3.8, 2.2, -3]} intensity={0.36} color="#7fc3ff" />
                <pointLight position={[2.5, -1.4, 3.2]} intensity={0.68} color="#ff8f8f" />
                <spotLight position={[0.6, 4.4, 3.4]} angle={0.52} penumbra={0.35} intensity={0.88} color="#ffd4ce" />

                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={2.5}
                    maxDistance={9}
                />

                <Suspense fallback={null}>
                    <AnatomicalStomachModel
                        showStress={showStress}
                        showThickness={showThickness}
                        wireframe={wireframe}
                        stressData={stressData}
                        highlightedRegion={highlightedRegion}
                        onRegionClick={onRegionClick}
                        surgeryType={surgeryType}
                    />
                    {showStapleLine && surgeryType === 'sleeve' && <SleeveStapleLine />}
                    {showStapleLine && surgeryType === 'bypass' && <BypassStapleLine />}
                    {showStapleLine && surgeryType === 'custom' && <SleeveStapleLine />}
                    {showStapleLine && <StaplerInstrument staplerColor={staplerColor} />}
                </Suspense>
            </Canvas>
        </div>
    );
}
