'use client';

import { Suspense, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════
   Anatomically-correct J-shaped stomach built with
   TubeGeometry along Catmull-Rom curves, NOT LatheGeometry.
   Matches the reference neon-glow illustration.
   ═══════════════════════════════════════════════════ */

/* ────────── Stomach outline path (center-line) ────────── */
function createStomachCenterCurve(): THREE.CatmullRomCurve3 {
    // J-shaped path: esophagus → fundus bulge → body → antrum → pylorus
    return new THREE.CatmullRomCurve3([
        // Esophagus — comes from upper-right, angled
        new THREE.Vector3(0.6, 3.8, 0),
        new THREE.Vector3(0.4, 3.2, 0),
        new THREE.Vector3(0.15, 2.6, 0),
        // Cardia — where esophagus meets stomach
        new THREE.Vector3(-0.1, 2.1, 0),
        // Fundus — big bulge to the left
        new THREE.Vector3(-0.8, 1.8, 0),
        new THREE.Vector3(-1.2, 1.2, 0),
        // Greater curvature — sweeping left and down
        new THREE.Vector3(-1.3, 0.5, 0),
        new THREE.Vector3(-1.2, -0.2, 0),
        new THREE.Vector3(-1.0, -0.9, 0),
        // Antrum — curving back to the right
        new THREE.Vector3(-0.6, -1.5, 0),
        new THREE.Vector3(-0.1, -1.9, 0),
        // Pylorus — narrow exit going right
        new THREE.Vector3(0.5, -2.1, 0),
        new THREE.Vector3(1.1, -2.0, 0),
        new THREE.Vector3(1.6, -1.8, 0),
    ], false, 'catmullrom', 0.3);
}

/* ────────── Variable-radius tube for the stomach ────────── */
function createStomachGeometry(): THREE.BufferGeometry {
    const curve = createStomachCenterCurve();
    const tubularSegments = 120;
    const radialSegments = 32;

    // Radius profile: thin esophagus → wide fundus/body → thin pylorus
    function radiusAt(t: number): number {
        if (t < 0.12) return 0.15 + t * 1.5;              // esophagus widens
        if (t < 0.25) return 0.33 + (t - 0.12) * 4.5;     // cardia → fundus
        if (t < 0.45) return 0.9 + Math.sin((t - 0.25) / 0.2 * Math.PI) * 0.15; // fundus peak
        if (t < 0.7) return 0.85 - (t - 0.45) * 0.8;      // body narrows
        if (t < 0.85) return 0.65 - (t - 0.7) * 2.0;      // antrum narrows
        return 0.35 - (t - 0.85) * 1.5;                    // pylorus
    }

    // Build a custom tube with varying radius
    const frames = curve.computeFrenetFrames(tubularSegments, false);
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= tubularSegments; i++) {
        const t = i / tubularSegments;
        const pos = curve.getPointAt(t);
        const N = frames.normals[i];
        const B = frames.binormals[i];
        const r = radiusAt(t);

        for (let j = 0; j <= radialSegments; j++) {
            const v = (j / radialSegments) * Math.PI * 2;
            const sin = Math.sin(v);
            const cos = Math.cos(v);

            const nx = cos * N.x + sin * B.x;
            const ny = cos * N.y + sin * B.y;
            const nz = cos * N.z + sin * B.z;

            vertices.push(pos.x + r * nx, pos.y + r * ny, pos.z + r * nz);
            normals.push(nx, ny, nz);
            uvs.push(t, j / radialSegments);
        }
    }

    for (let i = 0; i < tubularSegments; i++) {
        for (let j = 0; j < radialSegments; j++) {
            const a = i * (radialSegments + 1) + j;
            const b = a + radialSegments + 1;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
}

/* ────────── Internal vein / rugae network ────────── */
function StomachVeins() {
    const ref = useRef<THREE.Group>(null);
    const curve = useMemo(() => createStomachCenterCurve(), []);

    const veinLines = useMemo(() => {
        const colors = ['#00ffcc', '#00ddff', '#00aaff', '#0088ff', '#00ccaa'];
        const result: THREE.Line[] = [];
        for (let i = 0; i < 14; i++) {
            const pts: THREE.Vector3[] = [];
            const segs = 8 + Math.floor(Math.random() * 6);
            const startT = 0.15 + Math.random() * 0.65;
            for (let j = 0; j < segs; j++) {
                const t = Math.min(0.95, startT + j * 0.04 + Math.random() * 0.02);
                const center = curve.getPointAt(t);
                const angle = Math.random() * Math.PI * 2;
                const r = 0.15 + Math.random() * 0.35;
                pts.push(new THREE.Vector3(
                    center.x + Math.cos(angle) * r,
                    center.y + (Math.random() - 0.5) * 0.3,
                    center.z + Math.sin(angle) * r
                ));
            }
            const crv = new THREE.CatmullRomCurve3(pts);
            const geo = new THREE.BufferGeometry().setFromPoints(crv.getPoints(30));
            const mat = new THREE.LineBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.25 });
            result.push(new THREE.Line(geo, mat));
        }
        return result;
    }, [curve]);

    useFrame((state) => {
        if (!ref.current) return;
        ref.current.children.forEach((child, i) => {
            const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
            mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 0.5 + i * 0.6) * 0.15;
        });
    });

    return (
        <group ref={ref}>
            {veinLines.map((lineObj, i) => (
                <primitive key={i} object={lineObj} />
            ))}
        </group>
    );
}

/* ────────── Glowing stomach composite ────────── */
function GlowingStomach() {
    const groupRef = useRef<THREE.Group>(null);
    const bodyRef = useRef<THREE.Mesh>(null);
    const geometry = useMemo(() => createStomachGeometry(), []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            // Very gentle breathing / rotation
            groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.08;
            groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.03;
            groupRef.current.rotation.z = Math.cos(t * 0.08) * 0.02;
        }
        if (bodyRef.current) {
            const mat = bodyRef.current.material as THREE.MeshPhysicalMaterial;
            mat.emissiveIntensity = 0.5 + Math.sin(t * 1.0) * 0.2;
        }
    });

    return (
        <Float speed={0.5} rotationIntensity={0.03} floatIntensity={0.15}>
            <group ref={groupRef} position={[1.8, 0, 0]} scale={0.95}>

                {/* Bright cyan wireframe outline — the main neon edge look */}
                <mesh geometry={geometry}>
                    <meshBasicMaterial
                        color="#00e0ff"
                        wireframe
                        transparent
                        opacity={0.45}
                    />
                </mesh>

                {/* Solid translucent body with emissive glow */}
                <mesh ref={bodyRef} geometry={geometry}>
                    <meshPhysicalMaterial
                        color="#041a30"
                        roughness={0.35}
                        metalness={0.15}
                        transparent
                        opacity={0.35}
                        emissive="#0099ff"
                        emissiveIntensity={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* Inner glow — backside emissive for depth */}
                <mesh geometry={geometry} scale={0.92}>
                    <meshPhysicalMaterial
                        color="#001020"
                        roughness={0.5}
                        metalness={0}
                        transparent
                        opacity={0.15}
                        emissive="#0077ff"
                        emissiveIntensity={0.7}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Outer atmospheric bloom */}
                <mesh geometry={geometry} scale={1.06}>
                    <meshPhysicalMaterial
                        color="#000510"
                        roughness={1}
                        metalness={0}
                        transparent
                        opacity={0.06}
                        emissive="#00ccff"
                        emissiveIntensity={0.35}
                        side={THREE.FrontSide}
                    />
                </mesh>

                {/* Second finer wireframe for depth layering */}
                <mesh geometry={geometry} scale={1.012}>
                    <meshBasicMaterial color="#00aaff" wireframe transparent opacity={0.07} />
                </mesh>

                {/* Vein network inside */}
                <StomachVeins />
            </group>
        </Float>
    );
}

/* ────────── Bright particles clustered near stomach ────────── */
function FloatingParticles({ count = 250 }: { count?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    const { positions, speeds, sizes } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const spd = new Float32Array(count);
        const sz = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            // Cluster particles around the right side where stomach is
            const angle = Math.random() * Math.PI * 2;
            const radius = 0.5 + Math.random() * 6;
            pos[i * 3] = 1.8 + Math.cos(angle) * radius + (Math.random() - 0.5) * 3;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
            pos[i * 3 + 2] = Math.sin(angle) * radius * 0.5 + (Math.random() - 0.5) * 4;
            spd[i] = 0.06 + Math.random() * 0.3;
            sz[i] = 0.008 + Math.random() * 0.025;
        }
        return { positions: pos, speeds: spd, sizes: sz };
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const dummy = new THREE.Object3D();
        const t = state.clock.elapsedTime;
        for (let i = 0; i < count; i++) {
            dummy.position.set(
                positions[i * 3] + Math.sin(t * speeds[i] + i) * 0.25,
                positions[i * 3 + 1] + Math.cos(t * speeds[i] * 0.6 + i) * 0.2,
                positions[i * 3 + 2] + Math.sin(t * speeds[i] * 0.4 + i * 0.3) * 0.15
            );
            const twinkle = 0.5 + Math.sin(t * 2.5 + i * 1.9) * 0.5;
            dummy.scale.setScalar(sizes[i] * (0.5 + twinkle * 0.5));
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color="#00ddff" transparent opacity={0.65} />
        </instancedMesh>
    );
}

/* ────────── Subtle network lines in background ────────── */
function NetworkLines() {
    const ref = useRef<THREE.Group>(null);

    const lineObjects = useMemo(() => {
        const result: THREE.Line[] = [];
        const nodes: THREE.Vector3[] = [];
        for (let i = 0; i < 40; i++) {
            nodes.push(new THREE.Vector3(
                (Math.random() - 0.3) * 12,
                (Math.random() - 0.5) * 10,
                -1 - Math.random() * 5
            ));
        }
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].distanceTo(nodes[j]) < 3.5 && result.length < 60) {
                    const geo = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
                    const mat = new THREE.LineBasicMaterial({ color: '#0a4488', transparent: true, opacity: 0.05 });
                    result.push(new THREE.Line(geo, mat));
                }
            }
        }
        return result;
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        ref.current.children.forEach((child, i) => {
            const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
            mat.opacity = 0.03 + Math.sin(state.clock.elapsedTime * 0.35 + i * 0.2) * 0.02;
        });
    });

    return (
        <group ref={ref}>
            {lineObjects.map((lineObj, i) => (
                <primitive key={i} object={lineObj} />
            ))}
        </group>
    );
}

/* ────────── Mouse parallax camera ────────── */
function CameraRig() {
    const { camera } = useThree();
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    useFrame(() => {
        // Camera base is offset right to center the stomach on right half
        const targetX = 1.8 + mouseRef.current.x * 0.5;
        const targetY = 0.2 - mouseRef.current.y * 0.3;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;
        camera.lookAt(1.5, 0, 0);
    });

    return null;
}

/* ────────── Main Export ────────── */
export default function HeroStomach() {
    return (
        <div className="hero-canvas-wrapper">
            <Canvas
                camera={{ position: [1.8, 0.2, 7], fov: 45 }}
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#010208']} />
                <fog attach="fog" args={['#010208', 10, 28]} />

                <ambientLight intensity={0.04} />
                <directionalLight position={[4, 5, 5]} intensity={0.3} color="#0055ff" />
                <pointLight position={[0, 2, 4]} intensity={1.0} color="#00ccff" distance={14} />
                <pointLight position={[4, -2, 3]} intensity={0.6} color="#0044cc" distance={12} />
                <pointLight position={[2, 1, 5]} intensity={0.4} color="#00aaff" distance={12} />
                <pointLight position={[0, -1, 2]} intensity={0.5} color="#00ffcc" distance={10} />
                <pointLight position={[2, -3, 1]} intensity={0.3} color="#0066aa" distance={10} />

                <Suspense fallback={null}>
                    <GlowingStomach />
                    <FloatingParticles count={250} />
                    <NetworkLines />
                    <CameraRig />
                </Suspense>
            </Canvas>
        </div>
    );
}
