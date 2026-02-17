'use client';

import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ──────────────── Anatomical Stomach Shape ──────────────── */
function createStomachGeometry(): THREE.BufferGeometry {
    // Build a stomach cross-section profile using bezier curves
    // The shape: esophagus (top) → fundus (bulge left) → body → antrum → pylorus (bottom)
    const curve = new THREE.CurvePath<THREE.Vector2>();

    // Build the right-side profile for lathe rotation
    const points: THREE.Vector2[] = [];

    // Esophagus (narrow tube at top)
    points.push(new THREE.Vector2(0.15, 2.5));
    points.push(new THREE.Vector2(0.18, 2.3));
    points.push(new THREE.Vector2(0.2, 2.1));
    points.push(new THREE.Vector2(0.22, 1.9));

    // Cardia transition — widens into fundus
    points.push(new THREE.Vector2(0.3, 1.7));
    points.push(new THREE.Vector2(0.5, 1.5));
    points.push(new THREE.Vector2(0.8, 1.3));

    // Fundus (biggest bulge)
    points.push(new THREE.Vector2(1.05, 1.1));
    points.push(new THREE.Vector2(1.2, 0.9));
    points.push(new THREE.Vector2(1.3, 0.7));
    points.push(new THREE.Vector2(1.35, 0.5));

    // Body of stomach
    points.push(new THREE.Vector2(1.3, 0.3));
    points.push(new THREE.Vector2(1.2, 0.1));
    points.push(new THREE.Vector2(1.1, -0.1));
    points.push(new THREE.Vector2(1.0, -0.3));

    // Antrum (narrowing)
    points.push(new THREE.Vector2(0.85, -0.5));
    points.push(new THREE.Vector2(0.7, -0.7));
    points.push(new THREE.Vector2(0.55, -0.9));
    points.push(new THREE.Vector2(0.4, -1.1));

    // Pylorus (narrow exit)
    points.push(new THREE.Vector2(0.28, -1.3));
    points.push(new THREE.Vector2(0.22, -1.5));
    points.push(new THREE.Vector2(0.18, -1.7));
    points.push(new THREE.Vector2(0.15, -1.9));

    const geometry = new THREE.LatheGeometry(points, 64, 0, Math.PI * 2);
    geometry.computeVertexNormals();
    return geometry;
}

/* ──────────────── Glowing Wireframe Stomach ──────────────── */
function GlowingStomach() {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    const geometry = useMemo(() => createStomachGeometry(), []);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.003;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
            groupRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.03;
        }
        if (glowRef.current) {
            const mat = glowRef.current.material as THREE.MeshPhysicalMaterial;
            mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
        }
    });

    return (
        <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.3}>
            <group ref={groupRef} rotation={[0.15, 0.3, 0.1]} scale={0.85}>
                {/* Wireframe layer — the main visible edges */}
                <mesh geometry={geometry}>
                    <meshBasicMaterial
                        color="#00d4ff"
                        wireframe
                        transparent
                        opacity={0.55}
                    />
                </mesh>

                {/* Solid translucent body with emissive glow */}
                <mesh ref={glowRef} geometry={geometry}>
                    <meshPhysicalMaterial
                        color="#0a1628"
                        roughness={0.4}
                        metalness={0.2}
                        transparent
                        opacity={0.25}
                        emissive="#00aaff"
                        emissiveIntensity={0.4}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Inner glow core */}
                <mesh geometry={geometry} scale={0.92}>
                    <meshPhysicalMaterial
                        color="#001030"
                        roughness={0.6}
                        metalness={0}
                        transparent
                        opacity={0.15}
                        emissive="#4488ff"
                        emissiveIntensity={0.6}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Bright edge highlights */}
                <mesh geometry={geometry} scale={1.01}>
                    <meshBasicMaterial
                        color="#22ccff"
                        wireframe
                        transparent
                        opacity={0.12}
                    />
                </mesh>

                {/* Internal vein-like network lines */}
                <InternalVeins />
            </group>
        </Float>
    );
}

/* ──────────────── Internal Vein Network ──────────────── */
function InternalVeins() {
    const linesRef = useRef<THREE.Group>(null);

    const veins = useMemo(() => {
        const curves: THREE.CatmullRomCurve3[] = [];
        const count = 12;

        for (let i = 0; i < count; i++) {
            const pts: THREE.Vector3[] = [];
            const segments = 8 + Math.floor(Math.random() * 6);
            const startAngle = Math.random() * Math.PI * 2;
            const startY = (Math.random() - 0.3) * 3;
            const startR = 0.3 + Math.random() * 0.7;

            for (let j = 0; j < segments; j++) {
                const t = j / segments;
                const angle = startAngle + t * (Math.random() * 2 - 1) * 1.5;
                const r = startR * (1 - t * 0.3) + Math.random() * 0.15;
                const y = startY - t * 2 + Math.random() * 0.3;
                pts.push(new THREE.Vector3(
                    Math.cos(angle) * r,
                    y,
                    Math.sin(angle) * r
                ));
            }
            curves.push(new THREE.CatmullRomCurve3(pts));
        }
        return curves;
    }, []);

    useFrame((state) => {
        if (linesRef.current) {
            linesRef.current.children.forEach((child, i) => {
                const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
                mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 0.8 + i * 0.5) * 0.15;
            });
        }
    });

    return (
        <group ref={linesRef}>
            {veins.map((curve, i) => {
                const points = curve.getPoints(30);
                const geo = new THREE.BufferGeometry().setFromPoints(points);
                return (
                    <line key={i} geometry={geo}>
                        <lineBasicMaterial
                            color={i % 3 === 0 ? '#00ffcc' : i % 3 === 1 ? '#00aaff' : '#6644ff'}
                            transparent
                            opacity={0.25}
                        />
                    </line>
                );
            })}
        </group>
    );
}

/* ──────────────── Floating Particles ──────────────── */
function NeuralParticles({ count = 200 }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const { positions, speeds } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Distribute around the stomach area
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.5 + Math.random() * 6;
            pos[i * 3] = Math.cos(angle) * radius;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 4;
            spd[i] = 0.1 + Math.random() * 0.4;
        }
        return { positions: pos, speeds: spd };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        const t = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            dummy.position.set(
                positions[i * 3] + Math.sin(t * speeds[i] + i) * 0.2,
                positions[i * 3 + 1] + Math.cos(t * speeds[i] * 0.7 + i) * 0.2,
                positions[i * 3 + 2] + Math.sin(t * speeds[i] * 0.5 + i * 0.3) * 0.15
            );
            const s = 0.015 + Math.sin(t * 2 + i) * 0.008;
            dummy.scale.setScalar(s);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color="#00ccff" transparent opacity={0.6} />
        </instancedMesh>
    );
}

/* ──────────────── Network Connection Lines ──────────────── */
function NetworkLines() {
    const linesRef = useRef<THREE.Group>(null);

    const lines = useMemo(() => {
        const result: THREE.Vector3[][] = [];
        const nodeCount = 40;
        const nodes: THREE.Vector3[] = [];

        for (let i = 0; i < nodeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 5;
            nodes.push(new THREE.Vector3(
                Math.cos(angle) * r,
                (Math.random() - 0.5) * 7,
                Math.sin(angle) * r - 2
            ));
        }

        // Connect nearby nodes
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dist = nodes[i].distanceTo(nodes[j]);
                if (dist < 3 && result.length < 60) {
                    result.push([nodes[i], nodes[j]]);
                }
            }
        }
        return result;
    }, []);

    useFrame((state) => {
        if (linesRef.current) {
            linesRef.current.children.forEach((child, i) => {
                const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
                mat.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.5 + i * 0.2) * 0.04;
            });
        }
    });

    return (
        <group ref={linesRef}>
            {lines.map((pair, i) => {
                const geo = new THREE.BufferGeometry().setFromPoints(pair);
                return (
                    <line key={i} geometry={geo}>
                        <lineBasicMaterial color="#1a5faa" transparent opacity={0.08} />
                    </line>
                );
            })}
        </group>
    );
}

/* ──────────────── Main Background Component ──────────────── */
export default function StomachBackground() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0.5, 5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 1.5]}
            >
                <color attach="background" args={['#030812']} />

                {/* Fog for depth */}
                <fog attach="fog" args={['#030812', 10, 28]} />

                {/* Lighting — blue/cyan cinematic */}
                <ambientLight intensity={0.08} />
                <directionalLight position={[3, 5, 5]} intensity={0.4} color="#4488ff" />
                <pointLight position={[-3, 2, 3]} intensity={0.8} color="#00ccff" distance={15} />
                <pointLight position={[3, -2, 2]} intensity={0.5} color="#2244aa" distance={12} />
                <pointLight position={[0, 0, 4]} intensity={0.3} color="#6644ff" distance={10} />
                <pointLight position={[-2, -1, 1]} intensity={0.4} color="#00ffcc" distance={8} />

                <Suspense fallback={null}>
                    <GlowingStomach />
                    <NeuralParticles count={200} />
                    <NetworkLines />
                </Suspense>
            </Canvas>
        </div>
    );
}
