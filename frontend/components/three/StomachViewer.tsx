'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import AnatomicalStomachModel from './AnatomicalStomachModel';

/* ───────────────────────────────────────────────
   Sleeve Gastrectomy — vertical staple line along greater curvature
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

    // Resection shading — translucent area showing removed stomach
    const resectionGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(-0.22, 0.8);
        shape.bezierCurveTo(-0.6, 0.8, -0.85, 0.3, -0.9, -0.1);
        shape.bezierCurveTo(-0.95, -0.5, -0.7, -1.0, -0.3, -1.2);
        shape.bezierCurveTo(0.0, -1.3, 0.2, -1.2, 0.2, -1.2);
        shape.lineTo(-0.15, 0.0);
        shape.lineTo(-0.22, 0.8);
        const geo = new THREE.ShapeGeometry(shape, 24);
        return geo;
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
            <mesh geometry={resectionGeometry} position={[0, 0, 0.45]}>
                <meshBasicMaterial color="#ff4444" transparent opacity={0.08} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   Roux-en-Y Bypass — pouch division + roux limb
   ─────────────────────────────────────────────── */

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

    // Anastomosis ring at connection point
    const anastomosisRing = useMemo(() => new THREE.TorusGeometry(0.06, 0.015, 8, 24), []);

    return (
        <group position={[-0.1, -0.05, 0]}>
            <mesh geometry={pouchLine}>
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
            </mesh>
            <mesh geometry={rouxLimb}>
                <meshBasicMaterial color="#34d399" transparent opacity={0.6} />
            </mesh>
            <mesh geometry={anastomosisRing} position={[-0.15, 1.9, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   BPD/DS — Sleeve cut + long duodeno-ileal bypass
   ─────────────────────────────────────────────── */

function BPDDSStapleLine() {
    // Sleeve portion (same vertical cut)
    const sleeveGeometry = useMemo(() => {
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

    const sleeveDotsGeo = useMemo(() => new THREE.SphereGeometry(0.025, 8, 8), []);
    const sleeveDotsPos = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.18, 3.0, 0.32),
            new THREE.Vector3(0.0, 2.4, 0.38),
            new THREE.Vector3(-0.18, 1.6, 0.42),
            new THREE.Vector3(-0.22, 0.8, 0.44),
            new THREE.Vector3(-0.15, 0.0, 0.42),
            new THREE.Vector3(0.0, -0.6, 0.36),
            new THREE.Vector3(0.2, -1.2, 0.28),
        ], false, 'catmullrom', 0.5);
        return curve.getPoints(16);
    }, []);

    // Long duodeno-ileal bypass limb from duodenum
    const bypassLimb = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.42, -1.52, -0.1),
            new THREE.Vector3(1.8, -1.2, -0.15),
            new THREE.Vector3(2.2, -0.6, -0.2),
            new THREE.Vector3(2.4, 0.1, -0.25),
            new THREE.Vector3(2.2, 0.8, -0.2),
            new THREE.Vector3(1.8, 1.3, -0.1),
            new THREE.Vector3(1.3, 1.5, 0.0),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 100, 0.02, 12, false);
    }, []);

    const anastomosisRing = useMemo(() => new THREE.TorusGeometry(0.06, 0.015, 8, 24), []);

    return (
        <group position={[-0.1, -0.05, 0]}>
            {/* Sleeve cut */}
            <mesh geometry={sleeveGeometry}>
                <meshBasicMaterial color="#ef6844" transparent opacity={0.7} />
            </mesh>
            {sleeveDotsPos.map((pos, i) => (
                <mesh key={i} geometry={sleeveDotsGeo} position={pos}>
                    <meshBasicMaterial color="#f9a88a" />
                </mesh>
            ))}
            {/* Long bypass limb */}
            <mesh geometry={bypassLimb}>
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.55} />
            </mesh>
            {/* Anastomosis markers at both ends */}
            <mesh geometry={anastomosisRing} position={[1.42, -1.52, -0.1]} rotation={[0, 0, Math.PI / 4]}>
                <meshBasicMaterial color="#c4b5fd" transparent opacity={0.85} />
            </mesh>
            <mesh geometry={anastomosisRing} position={[1.3, 1.5, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#c4b5fd" transparent opacity={0.85} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   Adjustable Gastric Band (Lap-Band) — torus ring + port tube
   ─────────────────────────────────────────────── */

function LapBandVisualization() {
    const bandRef = useRef<THREE.Group>(null);

    // Pulsing animation for the band
    useFrame((state) => {
        if (bandRef.current) {
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;
            bandRef.current.scale.set(pulse, pulse, pulse);
        }
    });

    const bandGeometry = useMemo(() => new THREE.TorusGeometry(0.38, 0.055, 16, 48), []);

    // Tubing from band to subcutaneous port
    const tubingGeometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.38, 2.2, 0.35),
            new THREE.Vector3(0.7, 2.4, 0.3),
            new THREE.Vector3(1.1, 2.6, 0.15),
            new THREE.Vector3(1.5, 2.7, 0.0),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 60, 0.012, 8, false);
    }, []);

    // Subcutaneous injection port
    const portGeometry = useMemo(() => new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16), []);

    return (
        <group position={[-0.1, -0.05, 0]}>
            <group ref={bandRef} position={[0.05, 2.2, 0.15]} rotation={[0.15, 0, 0.05]}>
                <mesh geometry={bandGeometry}>
                    <meshPhysicalMaterial
                        color="#22d3ee"
                        metalness={0.6}
                        roughness={0.25}
                        clearcoat={0.8}
                        transparent
                        opacity={0.85}
                    />
                </mesh>
                {/* Band buckle/lock mechanism */}
                <mesh position={[0.38, 0, 0]}>
                    <boxGeometry args={[0.06, 0.08, 0.06]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>
            {/* Tubing */}
            <mesh geometry={tubingGeometry}>
                <meshBasicMaterial color="#67e8f9" transparent opacity={0.5} />
            </mesh>
            {/* Port */}
            <mesh geometry={portGeometry} position={[1.5, 2.7, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.2} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   SADI-S — Sleeve cut + single duodeno-ileal anastomosis
   ─────────────────────────────────────────────── */

function SADISStapleLine() {
    // Sleeve portion
    const sleeveGeometry = useMemo(() => {
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

    const dotsGeo = useMemo(() => new THREE.SphereGeometry(0.025, 8, 8), []);
    const dotsPos = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.18, 3.0, 0.32),
            new THREE.Vector3(0.0, 2.4, 0.38),
            new THREE.Vector3(-0.18, 1.6, 0.42),
            new THREE.Vector3(-0.22, 0.8, 0.44),
            new THREE.Vector3(-0.15, 0.0, 0.42),
            new THREE.Vector3(0.0, -0.6, 0.36),
            new THREE.Vector3(0.2, -1.2, 0.28),
        ], false, 'catmullrom', 0.5);
        return curve.getPoints(16);
    }, []);

    // Single anastomosis loop (shorter than BPD/DS)
    const anastomosisLoop = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.42, -1.52, -0.1),
            new THREE.Vector3(1.7, -1.0, -0.15),
            new THREE.Vector3(1.8, -0.3, -0.18),
            new THREE.Vector3(1.6, 0.3, -0.12),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 80, 0.018, 12, false);
    }, []);

    const anastomosisRing = useMemo(() => new THREE.TorusGeometry(0.055, 0.013, 8, 24), []);

    return (
        <group position={[-0.1, -0.05, 0]}>
            <mesh geometry={sleeveGeometry}>
                <meshBasicMaterial color="#7cb8ff" transparent opacity={0.7} />
            </mesh>
            {dotsPos.map((pos, i) => (
                <mesh key={i} geometry={dotsGeo} position={pos}>
                    <meshBasicMaterial color="#a8d4ff" />
                </mesh>
            ))}
            <mesh geometry={anastomosisLoop}>
                <meshBasicMaterial color="#fbbf24" transparent opacity={0.55} />
            </mesh>
            <mesh geometry={anastomosisRing} position={[1.42, -1.52, -0.1]} rotation={[0, 0, Math.PI / 4]}>
                <meshBasicMaterial color="#fde68a" transparent opacity={0.85} />
            </mesh>
        </group>
    );
}

/* ───────────────────────────────────────────────
   Revisional Surgery — pulsing re-staple line + correction markers
   ─────────────────────────────────────────────── */

function RevisionalStapleLine() {
    const groupRef = useRef<THREE.Group>(null);

    // Pulsing animation to indicate re-intervention zone
    useFrame((state) => {
        if (groupRef.current) {
            const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
            groupRef.current.children.forEach((child) => {
                if ((child as THREE.Mesh).material && 'opacity' in (child as THREE.Mesh).material) {
                    ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = pulse;
                }
            });
        }
    });

    // Original staple line (prior surgery)
    const priorLine = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.18, 3.0, 0.32),
            new THREE.Vector3(0.0, 2.4, 0.38),
            new THREE.Vector3(-0.18, 1.6, 0.42),
            new THREE.Vector3(-0.22, 0.8, 0.44),
            new THREE.Vector3(-0.15, 0.0, 0.42),
            new THREE.Vector3(0.0, -0.6, 0.36),
            new THREE.Vector3(0.2, -1.2, 0.28),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 120, 0.015, 12, false);
    }, []);

    // Revision re-staple line (slightly offset, showing correction)
    const revisionLine = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.22, 2.95, 0.34),
            new THREE.Vector3(0.04, 2.38, 0.40),
            new THREE.Vector3(-0.14, 1.58, 0.44),
            new THREE.Vector3(-0.18, 0.78, 0.46),
            new THREE.Vector3(-0.11, -0.02, 0.44),
            new THREE.Vector3(0.04, -0.62, 0.38),
            new THREE.Vector3(0.24, -1.22, 0.30),
        ], false, 'catmullrom', 0.5);
        return new THREE.TubeGeometry(curve, 120, 0.02, 12, false);
    }, []);

    // Correction markers (cross-hatch reinforcement points)
    const markerGeo = useMemo(() => new THREE.OctahedronGeometry(0.04, 0), []);
    const markerPositions = [
        new THREE.Vector3(0.0, 2.4, 0.40),
        new THREE.Vector3(-0.18, 1.6, 0.44),
        new THREE.Vector3(-0.22, 0.8, 0.46),
        new THREE.Vector3(-0.15, 0.0, 0.44),
        new THREE.Vector3(0.0, -0.6, 0.38),
    ];

    return (
        <group position={[-0.1, -0.05, 0]}>
            {/* Prior surgery line (faded) */}
            <mesh geometry={priorLine}>
                <meshBasicMaterial color="#6b7280" transparent opacity={0.35} />
            </mesh>
            {/* New revision staple line (pulsing) */}
            <group ref={groupRef}>
                <mesh geometry={revisionLine}>
                    <meshBasicMaterial color="#fb923c" transparent opacity={0.7} />
                </mesh>
            </group>
            {/* Reinforcement / correction markers */}
            {markerPositions.map((pos, i) => (
                <mesh key={i} geometry={markerGeo} position={pos}>
                    <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
                </mesh>
            ))}
        </group>
    );
}

/* ───────────────────────────────────────────────
   Surgical stapler instrument
   ─────────────────────────────────────────────── */

function StaplerInstrument({ staplerColor }: { staplerColor: string }) {
    return (
        <group position={[1.6, -0.5, 0.15]} rotation={[0.1, -0.3, 0.35]} scale={0.85}>
            <mesh castShadow>
                <cylinderGeometry args={[0.04, 0.04, 1.8, 12]} />
                <meshStandardMaterial color="#2a2d33" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.95, 0]} castShadow>
                <boxGeometry args={[0.12, 0.22, 0.08]} />
                <meshStandardMaterial color={staplerColor} metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[0.12, 0.18, 0.08]} />
                <meshStandardMaterial color="#3a3d44" metalness={0.75} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.7, 0.08]} rotation={[0.3, 0, 0]} castShadow>
                <boxGeometry args={[0.08, 0.5, 0.06]} />
                <meshStandardMaterial color="#1a1c20" metalness={0.5} roughness={0.5} />
            </mesh>
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
    const usesStapler = surgeryType !== 'lapband';

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
                    {showStapleLine && surgeryType === 'bpdds' && <BPDDSStapleLine />}
                    {showStapleLine && surgeryType === 'lapband' && <LapBandVisualization />}
                    {showStapleLine && surgeryType === 'sadis' && <SADISStapleLine />}
                    {showStapleLine && surgeryType === 'revisional' && <RevisionalStapleLine />}
                </Suspense>
            </Canvas>
        </div>
    );
}
