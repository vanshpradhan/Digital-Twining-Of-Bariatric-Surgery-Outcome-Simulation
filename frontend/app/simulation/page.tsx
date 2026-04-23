'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    Play,
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
    FileText,
    ArrowUpRight,
    Ruler,
    ChevronLeft,
    CheckCircle2,
    AlertTriangle,
    TrendingDown,
    Shield,
    Clock,
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

const tissueRegions = [
    { id: 0, region: 'EG Junction', thickness: 4.2, baseStress: 0.38, color: '#d4d4d4', description: 'Gastroesophageal junction — narrowest segment, highest tension concentration during stapling.' },
    { id: 1, region: 'Fundus',      thickness: 3.8, baseStress: 0.54, color: '#f1b9b9', description: 'Upper gastric dome — thin wall, moderate vascular density, prone to micro-tears.' },
    { id: 2, region: 'Body',        thickness: 4.5, baseStress: 0.66, color: '#f2c0c7', description: 'Gastric body — thickest musculature, highest mechanical resilience, key resection zone.' },
    { id: 3, region: 'Antrum',      thickness: 5.0, baseStress: 0.82, color: '#ffcc80', description: 'Antral region — dense smooth muscle, elevated intraluminal pressure post-op.' },
    { id: 4, region: 'Pylorus',     thickness: 5.5, baseStress: 0.93, color: '#d4d4d4', description: 'Pyloric sphincter — thickest wall, critical valve function preserved in sleeve procedures.' },
];

function computeFEM(surgery: string, staplerHeight: number) {
    const avgThickness = tissueRegions.reduce((a, r) => a + r.thickness, 0) / tissueRegions.length;
    const avgStiffness = tissueRegions.reduce((a, r) => a + r.baseStress, 0) / tissueRegions.length;

    const baseLeakRisk: Record<string, number> = { sleeve: 3.2, bypass: 4.8, custom: 2.9 };
    const staplerFactor = (staplerHeight - 2.5) / 3.0;
    const stiffnessFactor = 1.0 - avgStiffness * 0.28;
    const wallFactor = 1.0 - (avgThickness - 2.0) / 14.0;
    const leakRisk = (baseLeakRisk[surgery] ?? 3.5) * stiffnessFactor * (1 + staplerFactor * 0.38) * wallFactor;
    const regionStress = tissueRegions.map(r => r.baseStress * stiffnessFactor * (1 + staplerFactor * 0.25));
    const maxStressMPa = Math.max(...regionStress) * 58;
    const volReduction = surgery === 'sleeve' ? 74 : surgery === 'bypass' ? 92 : 68;
    const recovery = surgery === 'bypass' ? 21 : surgery === 'sleeve' ? 14 : 18;
    const successRate = Math.max(82, Math.min(98, 96 - leakRisk * 2.5 - (maxStressMPa > 50 ? 3 : 0)));
    const complicationRisk = Math.max(1, Math.min(18, leakRisk * 1.8 + (maxStressMPa > 50 ? 2 : 0)));
    const predictedBMI = surgery === 'sleeve' ? 28.5 : surgery === 'bypass' ? 26.2 : 29.8;
    const excessWeightLoss = surgery === 'sleeve' ? 62 : surgery === 'bypass' ? 72 : 55;
    return {
        leakRisk: +leakRisk.toFixed(1), maxStress: +maxStressMPa.toFixed(1),
        volReduction, recovery, regionStress,
        successRate: +successRate.toFixed(1), complicationRisk: +complicationRisk.toFixed(1),
        predictedBMI, excessWeightLoss,
    };
}

function SimulationContent() {
    const searchParams = useSearchParams();
    const patientName = searchParams.get('patientName') || '';
    const patientId = searchParams.get('patientId') || '';

    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showStress, setShowStress] = useState(false);
    const [showThickness, setShowThickness] = useState(false);
    const [showWireframe, setShowWireframe] = useState(false);
    const [showStapleLine, setShowStapleLine] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

    const [selectedStapler, setSelectedStapler] = useState(staplerTypes[1]);
    const [selectedSurgery, setSelectedSurgery] = useState(surgeryTypes[0].id);
    const [simulationComplete, setSimulationComplete] = useState(false);
    const [femResult, setFemResult] = useState<ReturnType<typeof computeFEM> | null>(null);

    const runSimulation = () => {
        setIsRunning(true);
        setProgress(0);
        setSimulationComplete(false);
        setFemResult(null);

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsRunning(false);
                    setSimulationComplete(true);
                    setShowStress(true);
                    const result = computeFEM(selectedSurgery, selectedStapler.height);
                    setFemResult(result);
                    return 100;
                }
                return prev + 2;
            });
        }, 80);
    };



    const activeRegion = selectedRegion !== null ? tissueRegions[selectedRegion] : null;

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
                <div className="hidden items-center gap-1 md:flex">
                    <button onClick={() => setShowWireframe(!showWireframe)} className={`rounded-none border border-white/20 p-2 transition ${showWireframe ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`} title="Toggle wireframe">
                        <Layers className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setShowStress(!showStress); if (showThickness) setShowThickness(false); }} className={`rounded-none border border-white/20 p-2 transition ${showStress ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`} title="Toggle stress map">
                        {showStress ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => { setShowThickness(!showThickness); if (showStress) setShowStress(false); }} className={`rounded-none border border-white/20 p-2 transition ${showThickness ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`} title="Toggle thickness map">
                        <Ruler className="h-4 w-4" />
                    </button>
                    <button onClick={() => setShowStapleLine(!showStapleLine)} className={`rounded-none border border-white/20 p-2 transition ${showStapleLine ? 'bg-[#141414] text-[#f5e6ce]' : 'text-[#8b8f98] hover:text-[#f5e6ce]'}`} title="Toggle staple line">
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
                        <div className="mb-3 flex items-center justify-between">
                            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#6f7480]">
                                <Gauge className="h-3.5 w-3.5" /> Tissue Analysis (Auto)
                            </p>
                            {activeRegion && (
                                <button onClick={() => setSelectedRegion(null)} className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#8b8f98] hover:text-[#f5e6ce] transition">
                                    <ChevronLeft className="h-3 w-3" /> All
                                </button>
                            )}
                        </div>
                        {activeRegion ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeRegion.color }} />
                                    <p className="text-sm font-bold text-[#f0dbbe]">{activeRegion.region}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="border border-white/10 bg-[#0d0d0d] p-2">
                                        <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Thickness</p>
                                        <p className="mt-1 text-base font-bold text-[#f0dbbe]">{activeRegion.thickness.toFixed(1)}mm</p>
                                    </div>
                                    <div className="border border-white/10 bg-[#0d0d0d] p-2">
                                        <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Stress</p>
                                        <p className="mt-1 text-base font-bold text-[#f0dbbe]">{(activeRegion.baseStress * 58).toFixed(1)} MPa</p>
                                    </div>
                                </div>
                                <p className="mt-2 text-[11px] leading-5 text-[#9ca3af]">{activeRegion.description}</p>
                                <div className="mt-2 h-1.5 w-full rounded bg-white/10">
                                    <div className="h-full rounded bg-gradient-to-r from-[#39d07a] to-[#e95555]" style={{ width: `${activeRegion.baseStress * 100}%` }} />
                                </div>
                                <div className="flex justify-between text-[9px] text-[#6f7480]"><span>Low risk</span><span>High risk</span></div>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {tissueRegions.map((item) => (
                                    <button key={item.id} onClick={() => setSelectedRegion(item.id)} className="flex w-full items-center justify-between rounded px-1 py-1 text-xs transition hover:bg-white/5">
                                        <div className="flex items-center gap-2 text-[#b9b9bd]">
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            {item.region}
                                        </div>
                                        <p className="font-semibold text-[#ecd5b4]">{item.thickness.toFixed(1)}mm / {(item.baseStress * 58).toFixed(0)} MPa</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className="flex min-w-0 flex-col border border-white/10 bg-[#060606]">
                    <div className="relative h-[520px] min-h-[440px] w-full">
                        <StomachViewer
                            showStress={showStress}
                            showThickness={showThickness}
                            showStapleLine={showStapleLine}
                            wireframe={showWireframe}
                            stressData={femResult?.regionStress}
                            highlightedRegion={selectedRegion}
                            onRegionClick={(id) => setSelectedRegion(prev => prev === id ? null : id)}
                            surgeryType={selectedSurgery}
                            staplerColor={selectedStapler.color}
                            className="h-full"
                        />
                        {showStress && (
                            <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-white/20 bg-black/70 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#78808d]">Stress (MPa)</p>
                                <div className="mt-1 h-2 w-40 bg-gradient-to-r from-[#37d67a] via-[#fbbf24] to-[#ef4444]" />
                                <div className="mt-1 flex justify-between text-[10px] text-[#b7b7b9]"><span>Low</span><span>High</span></div>
                            </div>
                        )}
                        {showThickness && (
                            <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-white/20 bg-black/70 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#78808d]">Wall Thickness</p>
                                <div className="mt-1 h-2 w-40 bg-gradient-to-r from-[#3b82f6] via-[#06b6d4] to-[#f97316]" />
                                <div className="mt-1 flex justify-between text-[10px] text-[#b7b7b9]"><span>Thin</span><span>Thick</span></div>
                            </div>
                        )}


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

                    {simulationComplete && femResult && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/10 bg-[#090909] p-4 space-y-4">
                            {/* Outcome verdict */}
                            <div className="flex items-center gap-3">
                                {femResult.successRate >= 90 ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                                )}
                                <div>
                                    <p className="text-lg font-bold text-[#f0dbbe]">
                                        {femResult.successRate >= 90 ? 'Favourable Outcome Predicted' : 'Moderate Risk Detected'}
                                    </p>
                                    <p className="text-xs text-[#8b8f98]">
                                        Based on patient tissue profile, {surgeryTypes.find(s => s.id === selectedSurgery)?.name} with {selectedStapler.name} stapler
                                    </p>
                                </div>
                            </div>

                            {/* Key metrics grid */}
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#6f7480]"><Shield className="h-3 w-3" />Success Rate</p>
                                    <p className="mt-1 text-2xl font-bold text-emerald-400">{femResult.successRate}%</p>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#6f7480]"><AlertTriangle className="h-3 w-3" />Complication Risk</p>
                                    <p className="mt-1 text-2xl font-bold text-[#f4e1c5]">{femResult.complicationRisk}%</p>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#6f7480]"><TrendingDown className="h-3 w-3" />Predicted BMI</p>
                                    <p className="mt-1 text-2xl font-bold text-[#f4e1c5]">{femResult.predictedBMI}</p>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-[#6f7480]"><Clock className="h-3 w-3" />Recovery</p>
                                    <p className="mt-1 text-2xl font-bold text-[#f4e1c5]">{femResult.recovery} <span className="text-sm font-normal text-[#8b8f98]">days</span></p>
                                </div>
                            </div>

                            {/* Additional details row */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="border border-white/10 bg-[#0d0d0d] py-2">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Leak Risk</p>
                                    <p className="mt-1 text-sm font-bold text-[#f0dbbe]">{femResult.leakRisk}%</p>
                                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase ${femResult.leakRisk < 4 ? 'bg-emerald-600/20 text-emerald-400' : 'bg-yellow-600/20 text-yellow-400'}`}>{femResult.leakRisk < 4 ? 'Low' : 'Moderate'}</span>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] py-2">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Max Stress</p>
                                    <p className="mt-1 text-sm font-bold text-[#f0dbbe]">{femResult.maxStress} MPa</p>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] py-2">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Excess Weight Loss</p>
                                    <p className="mt-1 text-sm font-bold text-[#f0dbbe]">{femResult.excessWeightLoss}%</p>
                                </div>
                            </div>

                            <Link href={`/results?patientId=${patientId}&patientName=${patientName}`} className="flex h-10 w-full items-center justify-center gap-1 border border-[#f0dfc6] bg-[#f0dfc6] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#e7d1b4]">
                                <FileText className="h-3.5 w-3.5" /> View Full Detailed Report <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </motion.div>
                    )}
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

                    <div>
                        <button
                            onClick={runSimulation}
                            disabled={isRunning}
                            className="flex w-full items-center justify-center gap-2 border border-[#f0dfc6] bg-[#f0dfc6] px-4 py-4 text-lg font-semibold uppercase tracking-[0.1em] text-black transition hover:bg-[#e7d1b4] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />} {isRunning ? 'Running' : 'Run Simulation'}
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
