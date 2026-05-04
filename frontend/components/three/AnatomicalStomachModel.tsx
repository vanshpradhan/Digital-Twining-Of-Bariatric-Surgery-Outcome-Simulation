'use client';

import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type LayerKind = 'serosa' | 'outerMuscle' | 'middleMuscle' | 'innerMuscle' | 'mucosa';

export type StomachRegionId = 0 | 1 | 2 | 3 | 4;

export interface AnatomicalStomachModelProps {
    showStress?: boolean;
    showThickness?: boolean;
    wireframe?: boolean;
    stressData?: number[];
    translucency?: number;
    highlightedRegion?: number | null;
    onRegionClick?: (id: number) => void;
    surgeryType?: string;
}

interface RegionDefinition {
    id: StomachRegionId;
    label: string;
    start: number;
    end: number;
    labelPosition: [number, number, number];
    badgeClassName: string;
}

interface ShellGeometryResult {
    geometry: THREE.BufferGeometry;
}

const REGION_DEFINITIONS: RegionDefinition[] = [
    {
        id: 0,
        label: 'EG Junction',
        start: 0.0,
        end: 0.11,
        labelPosition: [0.55, 3.6, 0.0],
        badgeClassName: 'border border-white/30 bg-black/80 text-[#d4d4d4]'
    },
    {
        id: 1,
        label: 'Fundus',
        start: 0.11,
        end: 0.34,
        labelPosition: [-1.7, 1.8, 0.5],
        badgeClassName: 'border border-[#6a3b3b] bg-[#351111]/90 text-[#f1b9b9]'
    },
    {
        id: 2,
        label: 'Body',
        start: 0.34,
        end: 0.67,
        labelPosition: [-1.7, -0.1, 0.55],
        badgeClassName: 'border border-[#7d3442] bg-[#3f1018]/90 text-[#f2c0c7]'
    },
    {
        id: 3,
        label: 'Antrum',
        start: 0.67,
        end: 0.88,
        labelPosition: [0.1, -2.3, 0.3],
        badgeClassName: 'border border-white/30 bg-black/80 text-[#d4d4d4]'
    },
    {
        id: 4,
        label: 'Pylorus',
        start: 0.88,
        end: 1.0,
        labelPosition: [1.9, -1.6, 0.0],
        badgeClassName: 'border border-white/30 bg-black/80 text-[#d4d4d4]'
    }
];

const DEFAULT_STRESS_BY_REGION: Record<StomachRegionId, number> = {
    0: 0.38,
    1: 0.54,
    2: 0.66,
    3: 0.82,
    4: 0.93
};

const REGION_BASE_TONE: Record<LayerKind, Record<StomachRegionId, THREE.Color>> = {
    serosa: {
        0: new THREE.Color('#e5b1b0'),
        1: new THREE.Color('#e6aeac'),
        2: new THREE.Color('#e2a3a2'),
        3: new THREE.Color('#db9b99'),
        4: new THREE.Color('#d39492')
    },
    outerMuscle: {
        0: new THREE.Color('#a72a2b'),
        1: new THREE.Color('#ab2d2f'),
        2: new THREE.Color('#9e2628'),
        3: new THREE.Color('#962224'),
        4: new THREE.Color('#8b1f21')
    },
    middleMuscle: {
        0: new THREE.Color('#ba3b37'),
        1: new THREE.Color('#be3f3b'),
        2: new THREE.Color('#b23835'),
        3: new THREE.Color('#aa3230'),
        4: new THREE.Color('#9f2e2c')
    },
    innerMuscle: {
        0: new THREE.Color('#cc4f45'),
        1: new THREE.Color('#d15349'),
        2: new THREE.Color('#c84c43'),
        3: new THREE.Color('#bf443d'),
        4: new THREE.Color('#b53d37')
    },
    mucosa: {
        0: new THREE.Color('#b8454c'),
        1: new THREE.Color('#bc4951'),
        2: new THREE.Color('#b3424a'),
        3: new THREE.Color('#a93b43'),
        4: new THREE.Color('#9d343d')
    }
};

function clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * clamp01(t);
}

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
}

function getRegionId(t: number): StomachRegionId {
    for (const region of REGION_DEFINITIONS) {
        if (t >= region.start && t <= region.end) {
            return region.id;
        }
    }
    return 4;
}

function buildCenterline() {
    return new THREE.CatmullRomCurve3(
        [
            new THREE.Vector3(0.08, 3.3, 0.0),
            new THREE.Vector3(0.02, 2.8, 0.02),
            new THREE.Vector3(-0.15, 2.3, 0.06),
            new THREE.Vector3(-0.42, 1.9, 0.14),
            new THREE.Vector3(-0.78, 1.5, 0.24),
            new THREE.Vector3(-1.05, 0.95, 0.3),
            new THREE.Vector3(-1.2, 0.2, 0.32),
            new THREE.Vector3(-1.15, -0.5, 0.28),
            new THREE.Vector3(-0.9, -1.1, 0.2),
            new THREE.Vector3(-0.5, -1.6, 0.12),
            new THREE.Vector3(0.05, -1.95, 0.04),
            new THREE.Vector3(0.6, -2.05, -0.02),
            new THREE.Vector3(1.1, -1.88, -0.08),
            new THREE.Vector3(1.42, -1.55, -0.1)
        ],
        false,
        'catmullrom',
        0.35
    );
}

function outerRadiusAt(t: number) {
    const egTransition = smoothstep(0.0, 0.12, t);
    const cardiacNotch = Math.exp(-Math.pow((t - 0.1) / 0.04, 2));
    const fundusBulge = Math.exp(-Math.pow((t - 0.22) / 0.13, 2));
    const bodyBulge = Math.exp(-Math.pow((t - 0.48) / 0.22, 2));
    const antrumTaper = smoothstep(0.65, 0.9, t);
    const pylorusNarrow = Math.exp(-Math.pow((t - 0.95) / 0.04, 2));

    return 0.22 + egTransition * 0.14 - cardiacNotch * 0.08
        + fundusBulge * 0.82 + bodyBulge * 0.55
        - antrumTaper * 0.28 - pylorusNarrow * 0.18;
}

function wallThicknessAt(t: number) {
    const fundus = Math.exp(-Math.pow((t - 0.2) / 0.14, 2));
    const body = Math.exp(-Math.pow((t - 0.48) / 0.2, 2));
    const antrum = Math.exp(-Math.pow((t - 0.78) / 0.1, 2));
    const pylorus = Math.exp(-Math.pow((t - 0.95) / 0.05, 2));

    return 0.055 + fundus * 0.02 + body * 0.04 + antrum * 0.085 + pylorus * 0.1;
}

function innerRugaeDepthAt(t: number, theta: number) {
    const foldZone = smoothstep(0.08, 0.72, t) * (1 - smoothstep(0.78, 0.98, t));
    const rugaePattern = Math.sin(theta * 7 + t * 26) * 0.5 + Math.sin(theta * 3 - t * 13) * 0.35;
    return Math.max(0, foldZone * (0.04 + rugaePattern * 0.018));
}

function colorFromStress(value: number) {
    const n = clamp01(value);
    const color = new THREE.Color();
    if (n < 0.25) {
        color.lerpColors(new THREE.Color('#0ea5e9'), new THREE.Color('#22c55e'), n * 4);
    } else if (n < 0.5) {
        color.lerpColors(new THREE.Color('#22c55e'), new THREE.Color('#eab308'), (n - 0.25) * 4);
    } else if (n < 0.75) {
        color.lerpColors(new THREE.Color('#eab308'), new THREE.Color('#f97316'), (n - 0.5) * 4);
    } else {
        color.lerpColors(new THREE.Color('#f97316'), new THREE.Color('#dc2626'), (n - 0.75) * 4);
    }
    return color;
}

function colorFromThickness(wallThickness: number) {
    const n = clamp01((wallThickness - 0.045) / 0.12);
    const color = new THREE.Color();
    if (n < 0.33) {
        color.lerpColors(new THREE.Color('#2563eb'), new THREE.Color('#06b6d4'), n * 3);
    } else if (n < 0.66) {
        color.lerpColors(new THREE.Color('#06b6d4'), new THREE.Color('#16a34a'), (n - 0.33) * 3);
    } else {
        color.lerpColors(new THREE.Color('#16a34a'), new THREE.Color('#ea580c'), (n - 0.66) * 3);
    }
    return color;
}

function layerColor(layer: LayerKind, regionId: StomachRegionId, t: number, theta: number, wallThickness: number) {
    const base = REGION_BASE_TONE[layer][regionId].clone();
    const thicknessTint = smoothstep(0.06, 0.15, wallThickness);

    if (layer === 'serosa') {
        const softVein = 0.5 + 0.5 * Math.sin(theta * 8 + t * 22);
        const grain = 0.5 + 0.22 * Math.sin(theta * 17 - t * 29) + 0.18 * Math.cos(theta * 9 + t * 11);
        base.multiplyScalar(lerp(0.9, 1.08, clamp01(grain)));
        base.offsetHSL(0, 0, (softVein - 0.5) * 0.08);
        base.multiplyScalar(lerp(1, 0.95, thicknessTint * 0.08));
        return base;
    }

    if (layer === 'mucosa') {
        const mazePattern =
            0.5 +
            0.28 * Math.sin(theta * 24 + t * 60) +
            0.2 * Math.cos(theta * 16 - t * 46) +
            0.1 * Math.sin(theta * 53 + t * 19);
        base.multiplyScalar(lerp(0.82, 1.18, clamp01(mazePattern)));
        base.lerp(new THREE.Color('#f08f86'), Math.max(0, mazePattern - 0.55) * 0.22);
        return base;
    }

    const phaseShift = layer === 'outerMuscle' ? 0.15 : layer === 'middleMuscle' ? -0.6 : 0.8;
    const fiberA = Math.sin(theta * (layer === 'middleMuscle' ? 11 : 5) + t * (layer === 'outerMuscle' ? 58 : 22) + phaseShift);
    const fiberB = Math.sin(theta * (layer === 'innerMuscle' ? 3 : 9) - t * (layer === 'innerMuscle' ? 68 : 14) - phaseShift * 2);
    const striation = 0.5 + 0.28 * fiberA + 0.18 * fiberB;
    base.multiplyScalar(lerp(0.78, 1.18, clamp01(striation)));
    base.multiplyScalar(lerp(1, 0.92, thicknessTint * 0.1));
    return base;
}

function radiusForLayer(layer: LayerKind, outerRadius: number, wallThickness: number, t: number, theta: number) {
    const layerOffset =
        layer === 'serosa' ? 0 :
            layer === 'outerMuscle' ? wallThickness * 0.28 :
                layer === 'middleMuscle' ? wallThickness * 0.5 :
                    layer === 'innerMuscle' ? wallThickness * 0.72 :
                        wallThickness * 0.9;

    const base = Math.max(0.05, outerRadius - layerOffset);
    if (layer !== 'mucosa') {
        return base;
    }

    const foldDepth = innerRugaeDepthAt(t, theta);
    return Math.max(0.04, base - foldDepth);
}

function createLayerGeometry(layer: LayerKind, showStress: boolean, showThickness: boolean, stressData?: number[]): ShellGeometryResult {
    const curve = buildCenterline();
    const tubularSegments = 180;
    const radialSegments = 54;
    const frames = curve.computeFrenetFrames(tubularSegments, false);

    const arcStart = -Math.PI * 0.12;
    const arcLength = Math.PI * 1.72;

    const positions: number[] = [];
    const uvs: number[] = [];
    const regions: number[] = [];
    const thicknesses: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const stressFallback = stressData ?? [
        DEFAULT_STRESS_BY_REGION[0],
        DEFAULT_STRESS_BY_REGION[1],
        DEFAULT_STRESS_BY_REGION[2],
        DEFAULT_STRESS_BY_REGION[3],
        DEFAULT_STRESS_BY_REGION[4]
    ];

    for (let i = 0; i <= tubularSegments; i++) {
        const t = i / tubularSegments;
        const regionId = getRegionId(t);
        const center = curve.getPointAt(t);
        const normal = frames.normals[i];
        const binormal = frames.binormals[i];

        const outerRadius = outerRadiusAt(t);
        const wallThickness = wallThicknessAt(t);
        for (let j = 0; j <= radialSegments; j++) {
            const theta = arcStart + (j / radialSegments) * arcLength;
            const ringVector = new THREE.Vector3()
                .copy(normal)
                .multiplyScalar(Math.cos(theta))
                .add(new THREE.Vector3().copy(binormal).multiplyScalar(Math.sin(theta)))
                .normalize();

            const greaterCurvatureBias = 1 + 0.42 * smoothstep(0.1, 0.6, t) * (1 - smoothstep(0.7, 0.95, t)) * Math.max(0, Math.cos(theta - 0.15));
            const lesserCurvatureFlat = 1 - 0.12 * smoothstep(0.15, 0.55, t) * Math.max(0, Math.cos(theta - Math.PI));
            const fundusDome = 1 + 0.22 * Math.exp(-Math.pow((t - 0.2) / 0.12, 2)) * Math.max(0, -Math.sin(theta));
            const antralCompression = 1 - 0.2 * smoothstep(0.68, 0.95, t);
            const layerRadius = radiusForLayer(layer, outerRadius, wallThickness, t, theta);
            const finalRadius = layerRadius * greaterCurvatureBias * lesserCurvatureFlat * fundusDome * antralCompression;

            const point = center.clone().add(ringVector.multiplyScalar(finalRadius));

            positions.push(point.x, point.y, point.z);
            uvs.push(t, j / radialSegments);
            regions.push(regionId);
            thicknesses.push(wallThickness);

            if (showThickness) {
                const thickColor = colorFromThickness(wallThickness);
                colors.push(thickColor.r, thickColor.g, thickColor.b);
            } else if (showStress) {
                const regionStress = stressFallback[regionId] ?? stressFallback[stressFallback.length - 1];
                const localVar = 0.06 * Math.sin(t * 40 + theta * 5) + 0.04 * Math.cos(t * 18 - theta * 8);
                const stressBoost = layer === 'mucosa' ? 0.95 : layer === 'serosa' ? 1.05 : 0.88;
                const shellColor = colorFromStress(clamp01(regionStress * stressBoost + localVar));
                colors.push(shellColor.r, shellColor.g, shellColor.b);
            } else {
                const tissue = layerColor(layer, regionId, t, theta, wallThickness);
                colors.push(tissue.r, tissue.g, tissue.b);
            }
        }
    }

    for (let i = 0; i < tubularSegments; i++) {
        const startIndex = i * (radialSegments + 1);

        for (let j = 0; j < radialSegments; j++) {
            const a = startIndex + j;
            const b = a + radialSegments + 1;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('regionId', new THREE.Float32BufferAttribute(regions, 1));
    geometry.setAttribute('thickness', new THREE.Float32BufferAttribute(thicknesses, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.userData = {
        layer,
        regionDefinitions: REGION_DEFINITIONS,
        exportFormat: 'GLB/GLTF'
    };

    for (let i = 0; i < tubularSegments; i++) {
        const bandRegion = getRegionId((i + 0.5) / tubularSegments);
        geometry.addGroup(i * radialSegments * 6, radialSegments * 6, bandRegion);
    }

    return { geometry };
}

function LayerMesh({
    geometry,
    wireframe,
    opacity,
    layer,
    showStress,
}: {
    geometry: THREE.BufferGeometry;
    wireframe: boolean;
    opacity: number;
    layer: LayerKind;
    showStress: boolean;
}) {
    const isSerosa = layer === 'serosa';
    const isMucosa = layer === 'mucosa';
    const shellColor = isSerosa ? '#f0b8b4' : isMucosa ? '#c24e55' : '#a4282f';
    const roughness = isSerosa ? 0.36 : isMucosa ? 0.44 : 0.33;
    const clearcoat = isSerosa ? 0.28 : isMucosa ? 0.16 : 0.08;
    const emissive = isSerosa ? '#611c1f' : isMucosa ? '#7c111b' : '#4a1015';

    return (
        <group>
            <mesh geometry={geometry} castShadow receiveShadow>
                <meshPhysicalMaterial
                    color={shellColor}
                    roughness={roughness}
                    metalness={0.03}
                    clearcoat={clearcoat}
                    clearcoatRoughness={isSerosa ? 0.34 : 0.5}
                    transmission={0}
                    thickness={isSerosa ? 0.22 : isMucosa ? 0.18 : 0.12}
                    ior={1.36}
                    attenuationColor={isSerosa ? '#f9c5c0' : isMucosa ? '#e97d80' : '#d56464'}
                    attenuationDistance={isSerosa ? 2.6 : 1.7}
                    emissive={emissive}
                    emissiveIntensity={showStress ? 0.03 : isSerosa ? 0.08 : 0.07}
                    transparent={opacity < 0.995}
                    opacity={opacity}
                    depthWrite
                    vertexColors
                    side={THREE.DoubleSide}
                />
            </mesh>
            {wireframe && (
                <mesh geometry={geometry}>
                    <meshBasicMaterial
                        color={showStress ? '#ffffff' : isSerosa ? '#ffdad6' : isMucosa ? '#f1a1a6' : '#e28686'}
                        wireframe
                        transparent
                        opacity={showStress ? 0.55 : 0.16}
                        depthWrite={false}
                        side={THREE.DoubleSide}
                        vertexColors={showStress}
                    />
                </mesh>
            )}
        </group>
    );
}

function ConnectorTube({
    points,
    color,
    radius,
    opacity,
}: {
    points: THREE.Vector3[];
    color: string;
    radius: number;
    opacity: number;
}) {
    const geometry = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5), 80, radius, 18, false), [points, radius]);

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshPhysicalMaterial
                color={color}
                roughness={0.38}
                metalness={0.03}
                clearcoat={0.24}
                clearcoatRoughness={0.36}
                emissive="#4a0d10"
                emissiveIntensity={0.08}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

export default function AnatomicalStomachModel({
    showStress = false,
    showThickness = false,
    wireframe = false,
    stressData,
    translucency = 0.98,
    highlightedRegion = null,
    onRegionClick,
    surgeryType = 'sleeve',
}: AnatomicalStomachModelProps) {
    const groupRef = useRef<THREE.Group>(null);

    const model = useMemo(
        () => ({
            serosa: createLayerGeometry('serosa', showStress, showThickness, stressData),
            outerMuscle: createLayerGeometry('outerMuscle', showStress, showThickness, stressData),
            middleMuscle: createLayerGeometry('middleMuscle', showStress, showThickness, stressData),
            innerMuscle: createLayerGeometry('innerMuscle', showStress, showThickness, stressData),
            mucosa: createLayerGeometry('mucosa', showStress, showThickness, stressData)
        }),
        [showStress, showThickness, stressData]
    );

    useFrame((state) => {
        if (!groupRef.current) {
            return;
        }

        const elapsed = state.clock.elapsedTime;
        groupRef.current.rotation.y = Math.sin(elapsed * 0.15) * 0.06;
        groupRef.current.rotation.x = Math.cos(elapsed * 0.12) * 0.025;
        groupRef.current.rotation.z = Math.sin(elapsed * 0.08) * 0.02;
    });

    return (
        <group ref={groupRef} position={[-0.1, -0.05, 0]} scale={0.98} rotation={[-0.03, -0.12, -0.08]}>
            <ConnectorTube
                points={[
                    new THREE.Vector3(0.02, 3.95, 0.02),
                    new THREE.Vector3(0.04, 3.45, 0.02),
                    new THREE.Vector3(0.0, 3.0, 0.03),
                    new THREE.Vector3(0.02, 2.55, 0.04)
                ]}
                color="#f1a29b"
                radius={0.13}
                opacity={0.95}
            />

            <ConnectorTube
                points={[
                    new THREE.Vector3(1.12, -1.75, -0.05),
                    new THREE.Vector3(1.35, -1.95, -0.1),
                    new THREE.Vector3(1.62, -1.88, -0.12),
                    new THREE.Vector3(1.78, -1.55, -0.12),
                    new THREE.Vector3(1.88, -1.18, -0.1)
                ]}
                color="#e4948b"
                radius={0.12}
                opacity={0.92}
            />

            <LayerMesh geometry={model.serosa.geometry} wireframe={wireframe} opacity={translucency} layer="serosa" showStress={showStress} />

            {!showStress && !showThickness && (
                <>
                    <LayerMesh geometry={model.outerMuscle.geometry} wireframe={wireframe} opacity={0.96} layer="outerMuscle" showStress={showStress} />
                    <LayerMesh geometry={model.middleMuscle.geometry} wireframe={wireframe} opacity={0.95} layer="middleMuscle" showStress={showStress} />
                    <LayerMesh geometry={model.innerMuscle.geometry} wireframe={wireframe} opacity={0.94} layer="innerMuscle" showStress={showStress} />
                </>
            )}

            <LayerMesh geometry={model.mucosa.geometry} wireframe={wireframe} opacity={showStress || showThickness ? 0.9 : 0.97} layer="mucosa" showStress={showStress} />

            {/* Clickable region labels */}
            {REGION_DEFINITIONS.map((region) => {
                const isHighlighted = highlightedRegion === region.id;
                return (
                    <Html key={region.id} position={region.labelPosition} center>
                        <button
                            onClick={() => onRegionClick?.(region.id)}
                            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                            tabIndex={0}
                        >
                            <div
                                className={`whitespace-nowrap px-2 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm transition-all duration-200 ${region.badgeClassName}`}
                                style={{
                                    borderWidth: isHighlighted ? '1.5px' : '1px',
                                    boxShadow: isHighlighted
                                        ? '0 0 0 2px rgba(240,223,198,0.55), 0 0 12px 4px rgba(240,200,140,0.3)'
                                        : 'none',
                                    transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
                                    opacity: highlightedRegion !== null && !isHighlighted ? 0.55 : 1,
                                    borderRadius: '2px',
                                }}
                            >
                                {region.label}
                            </div>
                        </button>
                    </Html>
                );
            })}
        </group>
    );
}
