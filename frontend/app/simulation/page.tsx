'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    Play,
    RotateCcw,
    FlaskConical,
    Layers,
    Eye,
    EyeOff,
    Loader2,
    ArrowLeft,
    User,
    Activity,
    Bone,
    Microscope,
    Stethoscope,
    Gauge,
    Droplet,
    HeartPulse,
    ChevronDown,
    FileText,
    ArrowUpRight,
    Undo2,
} from 'lucide-react';

const StomachViewer = dynamic(
    () => import('@/components/three/StomachViewer'),
    { ssr: false, loading: () => <div className="flex items-center justify-center" style={{ height: 400 }}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div> }
);

const staplerTypes = [
    { id: 'linear_white', name: 'Linear White', height: 2.5, tissue: '1.0-1.5mm', color: '#f5f5f5' },
    { id: 'linear_blue', name: 'Linear Blue', height: 3.5, tissue: '1.5-2.0mm', color: '#60a5fa' },
    { id: 'linear_gold', name: 'Linear Gold', height: 3.8, tissue: '1.8-2.5mm', color: '#facc15' },
    { id: 'linear_green', name: 'Linear Green', height: 4.8, tissue: '2.0-3.0mm', color: '#34d399' },
    { id: 'linear_black', name: 'Linear Black', height: 5.5, tissue: '3.0-4.0mm', color: '#94a3b8' },
];

const surgeryTypes = [
    {
        id: 'sleeve',
        name: 'Sleeve Gastrectomy',
        description: 'Removes ~80% of the stomach, creating a tubular pouch',
        icon: Bone,
    },
    {
        id: 'bypass',
        name: 'Roux-en-Y Bypass',
        description: 'Creates a small pouch and bypasses part of the intestine',
        icon: Activity,
    },
    {
        id: 'custom',
        name: 'Custom Procedure',
        description: 'Research-based custom staple configuration',
        icon: Microscope,
    },
];

const tissueAnalysis = [
    { region: 'EG Junction', thickness: '4.2mm', stress: '0.8 MPa' },
    { region: 'Fundus', thickness: '3.8mm', stress: '0.6 MPa' },
    { region: 'Body', thickness: '4.5mm', stress: '0.7 MPa' },
    { region: 'Antrum', thickness: '5.0mm', stress: '0.9 MPa' },
    { region: 'Pylorus', thickness: '5.5mm', stress: '1.0 MPa' },
];

function SimulationContent() {
    const searchParams = useSearchParams();
    const patientName = searchParams.get('patientName') || '';
    const patientId = searchParams.get('patientId') || '';

    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showStress, setShowStress] = useState(false);
    const [showWireframe, setShowWireframe] = useState(false);
    const [showStapleLine, setShowStapleLine] = useState(true);
    const [selectedStapler, setSelectedStapler] = useState(staplerTypes[1]);
    const [selectedSurgery, setSelectedSurgery] = useState(surgeryTypes[0].id);
    const [simulationComplete, setSimulationComplete] = useState(false);

    const [params, setParams] = useState({
        tissueStiffness: 0.6,
        wallThickness: 3.5,
    });

    const runSimulation = () => {
        setIsRunning(true);
        setProgress(0);
        setSimulationComplete(false);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsRunning(false);
                    setSimulationComplete(true);
                    setShowStress(true);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);
    };

    const resetSimulation = () => {
        setProgress(0);
        setIsRunning(false);
        setSimulationComplete(false);
        setShowStress(false);
    };

    const leakRisk = simulationComplete ? 3.3 : 3.3;
    const maxStress = simulationComplete ? 49.4 : 49.4;

    return (
        <div className="space-y-5 pb-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                    <Link href={patientId ? `/patients/${patientId}` : '/patients'} className="page-back">
                        <ArrowLeft className="h-4 w-4" /> Back to Patient
                    </Link>
                    <h1
                        className="mt-1 text-5xl font-semibold italic tracking-tight text-[#f6e9d3]"
                        style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
                    >
                        FEM Simulation
                    </h1>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <button
                        onClick={() => setShowWireframe(!showWireframe)}
                        className={`rounded-none border border-white/20 p-2 transition ${showWireframe ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`}
                        title="Toggle wireframe"
                    >
                        <Layers className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setShowStress(!showStress)}
                        className={`rounded-none border border-white/20 p-2 transition ${showStress ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`}
                        title="Toggle stress"
                    >
                        {showStress ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => setShowStapleLine(!showStapleLine)}
                        className={`rounded-none border border-white/20 p-2 transition ${showStapleLine ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`}
                        title="Toggle staple line"
                    >
                        <FlaskConical className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(620px,1fr)_320px]">
                <section className="space-y-3">
                    <div className="border border-white/15 bg-[#070707] p-3">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                            <User className="h-4 w-4 text-[#d4c0a2]" />
                            <div>
                                <p className="font-semibold text-[#f8ead4]">{decodeURIComponent(patientName) || 'John Smith'}</p>
                                <p className="text-xs text-[#b45858]">P-2024-001</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div className="border border-white/10 bg-[#0d0d0d] py-2">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#6f7480]">Age</p>
                                <p className="mt-1 text-lg font-bold text-[#f0dbbe]">45</p>
                            </div>
                            <div className="border border-white/10 bg-[#0d0d0d] py-2">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#6f7480]">BMI</p>
                                <p className="mt-1 text-lg font-bold text-[#f0dbbe]">42.5</p>
                            </div>
                            <div className="border border-white/10 bg-[#0d0d0d] py-2">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#6f7480]">Sex</p>
                                <p className="mt-1 text-lg font-bold text-[#f0dbbe]">M</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="border border-white/10 bg-[#070707] p-3">
                            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6f7480]">
                                <HeartPulse className="h-3.5 w-3.5" /> Comorbidities
                            </p>
                            <p className="text-sm leading-6 text-[#c9c9cb]">Type 2 Diabetes, Hypertension, Obstructive Sleep Apnea</p>
                        </div>
                        <div className="border border-white/10 bg-[#070707] p-3">
                            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6f7480]">
                                <Droplet className="h-3.5 w-3.5" /> Current Medications
                            </p>
                            <p className="text-sm leading-6 text-[#c9c9cb]">Metformin 1000mg BID, Lisinopril 20mg daily, CPAP nightly</p>
                        </div>
                        <div className="border border-white/10 bg-[#070707] p-3">
                            <p className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6f7480]">
                                <Stethoscope className="h-3.5 w-3.5" /> Surgical History
                            </p>
                            <p className="text-sm leading-6 text-[#c9c9cb]">Appendectomy (2010), Cholecystectomy (2018)</p>
                        </div>
                    </div>

                    <div className="border border-white/10 bg-[#070707] p-3">
                        <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6f7480]">
                            <Gauge className="h-3.5 w-3.5" /> Tissue Analysis (Auto)
                        </p>
                        <div className="space-y-2">
                            {tissueAnalysis.map((item) => (
                                <div key={item.region} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-[#b9b9bd]">
                                        <span className="h-2 w-2 rounded-full bg-[#d7a7a7]" />
                                        {item.region}
                                    </div>
                                    <p className="font-semibold text-[#ecd5b4]">{item.thickness} / {item.stress}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex min-w-0 flex-col border border-white/10 bg-[#060606]">
                    <div className="relative h-[520px] min-h-[440px] w-full">
                        <StomachViewer
                            showStress={showStress || simulationComplete}
                            showStapleLine={showStapleLine}
                            wireframe={showWireframe}
                            className="h-full"
                        />
                        <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-white/20 bg-black/70 px-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#78808d]">Stress (MPa)</p>
                            <div className="mt-1 h-2 w-40 bg-gradient-to-r from-[#37d67a] via-[#fbbf24] to-[#ef4444]" />
                            <div className="mt-1 flex justify-between text-[10px] text-[#b7b7b9]">
                                <span>Low</span>
                                <span>High</span>
                            </div>
                        </div>
                        <button
                            onClick={resetSimulation}
                            className="absolute bottom-3 right-3 border border-white/20 bg-black/70 p-2 text-[#e4d2b4] transition hover:bg-black"
                            title="Reset simulation"
                        >
                            <Undo2 className="h-4 w-4" />
                        </button>
                    </div>

                    {isRunning && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-white/10 bg-[#090909] px-4 py-3">
                            <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="text-[#d1d5db]">Running simulation...</span>
                                <span className="text-[#86b8ff]">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10">
                                <motion.div className="h-full bg-[#3b82f6]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-[#090909] p-4 md:grid-cols-5">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7480]">Leak Risk</p>
                            <p className="mt-1 text-4xl font-semibold italic text-[#f4e1c5]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                                {leakRisk}%
                            </p>
                            <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">Low</span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7480]">Max Stress</p>
                            <p className="mt-1 text-4xl font-semibold italic text-[#f4e1c5]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                                {maxStress}
                            </p>
                            <p className="text-sm font-semibold text-[#9ca3af]">MPa</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7480]">Vol. Reduction</p>
                            <p className="mt-1 text-4xl font-semibold italic text-[#f4e1c5]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                                74%
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#6f7480]">Recovery</p>
                            <p className="mt-1 text-4xl font-semibold italic text-[#f4e1c5]" style={{ fontFamily: 'Georgia, Times New Roman, serif' }}>
                                14
                            </p>
                            <p className="text-sm font-semibold text-[#9ca3af]">days</p>
                        </div>
                        <div className="flex items-end gap-2">
                            <button className="flex h-10 items-center gap-1 border border-white/15 px-3 text-xs uppercase tracking-[0.14em] text-[#d4d4d8] transition hover:border-white/25">
                                <ChevronDown className="h-3.5 w-3.5" /> Details
                            </button>
                            <Link
                                href={`/results?patientId=${patientId}&patientName=${patientName}`}
                                className="flex h-10 items-center gap-1 border border-[#f0dfc6] bg-[#f0dfc6] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#e7d1b4]"
                            >
                                <FileText className="h-3.5 w-3.5" /> Full Report <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7f89]">Surgery Type</p>
                        <div className="space-y-2 border-t border-white/10 pt-3">
                            {surgeryTypes.map((surgery) => {
                                const Icon = surgery.icon;
                                const isSelected = selectedSurgery === surgery.id;
                                return (
                                    <button
                                        key={surgery.id}
                                        onClick={() => setSelectedSurgery(surgery.id)}
                                        className={`w-full border p-3 text-left transition ${isSelected ? 'border-[#d4b891] bg-[#181512]' : 'border-white/15 bg-[#070707] hover:border-white/30'}`}
                                    >
                                        <p className={`flex items-center gap-2 text-sm font-semibold ${isSelected ? 'text-[#f2dfc3]' : 'text-[#c3c8d0]'}`}>
                                            <Icon className="h-3.5 w-3.5" /> {surgery.name}
                                        </p>
                                        <p className="mt-1 text-xs text-[#8b8f98]">{surgery.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7f89]">Stapler Selection</p>
                        <div className="space-y-2 border-t border-white/10 pt-3">
                            {staplerTypes.map((stapler) => {
                                const isSelected = selectedStapler.id === stapler.id;
                                return (
                                    <button
                                        key={stapler.id}
                                        onClick={() => setSelectedStapler(stapler)}
                                        className={`w-full border p-3 text-left transition ${isSelected ? 'border-[#d4b891] bg-[#181512]' : 'border-white/15 bg-[#070707] hover:border-white/30'}`}
                                    >
                                        <p className={`flex items-center gap-2 text-sm font-semibold ${isSelected ? 'text-[#f2dfc3]' : 'text-[#c3c8d0]'}`}>
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stapler.color }} />
                                            {stapler.name}
                                        </p>
                                        <p className="mt-1 text-xs text-[#8b8f98]">Height: {stapler.height}mm · Tissue: {stapler.tissue}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border border-white/10 bg-[#070707] p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7b7f89]">Tissue Parameters</p>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 flex justify-between text-xs text-[#9ca3af]">
                                    <span>Tissue Stiffness</span>
                                    <span>{params.tissueStiffness.toFixed(1)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={params.tissueStiffness}
                                    onChange={(e) => setParams({ ...params, tissueStiffness: parseFloat(e.target.value) })}
                                    className="w-full accent-[#d4b891]"
                                />
                            </div>
                            <div>
                                <label className="mb-2 flex justify-between text-xs text-[#9ca3af]">
                                    <span>Wall Thickness (mm)</span>
                                    <span>{params.wallThickness.toFixed(1)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="2.0"
                                    max="6.0"
                                    step="0.5"
                                    value={params.wallThickness}
                                    onChange={(e) => setParams({ ...params, wallThickness: parseFloat(e.target.value) })}
                                    className="w-full accent-[#d4b891]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={runSimulation}
                            disabled={isRunning}
                            className="flex w-full items-center justify-center gap-2 border border-[#f0dfc6] bg-[#f0dfc6] px-4 py-4 text-lg font-semibold uppercase tracking-[0.1em] text-black transition hover:bg-[#e7d1b4] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />} {isRunning ? 'Running' : 'Run Simulation'}
                        </button>
                        <button
                            onClick={resetSimulation}
                            className="flex w-full items-center justify-center gap-2 border border-white/20 bg-[#0d0d0d] px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#d1d5db] transition hover:border-white/35"
                        >
                            <RotateCcw className="h-4 w-4" /> Reset
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function SimulationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center" style={{ minHeight: '60vh' }}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}>
            <SimulationContent />
        </Suspense>
    );
}
