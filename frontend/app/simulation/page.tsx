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
    Scissors,
    Wrench,
    CircleDot,
    RotateCcw,
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
        id: 'bpdds',
        name: 'BPD/DS',
        description: 'Combines sleeve gastrectomy with substantial small intestine bypass for highest weight loss',
        icon: Scissors,
    },
    {
        id: 'lapband',
        name: 'Adjustable Gastric Band',
        description: 'Reversible inflatable band around the stomach top, adjustable over time',
        icon: CircleDot,
    },
    {
        id: 'sadis',
        name: 'SADI-S',
        description: 'Simplified duodenal switch — sleeve plus single duodeno-ileal anastomosis',
        icon: Microscope,
    },
    {
        id: 'revisional',
        name: 'Revisional Surgery',
        description: 'Corrects or modifies a previous bariatric surgery due to complications or inadequate loss',
        icon: RotateCcw,
    },
];

const tissueRegions = [
    { id: 0, region: 'EG Junction', thickness: 4.2, baseStress: 0.38, color: '#d4d4d4', description: 'Gastroesophageal junction — narrowest segment, highest tension concentration during stapling.' },
    { id: 1, region: 'Fundus',      thickness: 3.8, baseStress: 0.54, color: '#f1b9b9', description: 'Upper gastric dome — thin wall, moderate vascular density, prone to micro-tears.' },
    { id: 2, region: 'Body',        thickness: 4.5, baseStress: 0.66, color: '#f2c0c7', description: 'Gastric body — thickest musculature, highest mechanical resilience, key resection zone.' },
    { id: 3, region: 'Antrum',      thickness: 5.0, baseStress: 0.82, color: '#ffcc80', description: 'Antral region — dense smooth muscle, elevated intraluminal pressure post-op.' },
    { id: 4, region: 'Pylorus',     thickness: 5.5, baseStress: 0.93, color: '#d4d4d4', description: 'Pyloric sphincter — thickest wall, critical valve function preserved in sleeve procedures.' },
];

interface ClinicalOutcome {
    leakRisk: number; maxStress: number; volReduction: number; recovery: number;
    regionStress: number[]; successRate: number; complicationRisk: number;
    predictedBMI: number; excessWeightLoss: number;
    procedureSummary: string;
    stomachVolumePreOp: number; stomachVolumePostOp: number;
    diabetesRemission: number; hypertensionImprovement: number;
    nutritionalDeficiencies: { nutrient: string; risk: string; level: string }[];
    ghrelinReduction: number; glp1Change: number;
    operativeTime: number; hospitalStay: number;
    mortalityRate30Day: number; revisionalNeed5Year: number;
    weightRegain5Year: number;
}

const clinicalProfiles: Record<string, {
    summary: string; volPre: number; volPost: number;
    diabRemission: number; htnImprovement: number;
    nutrients: { nutrient: string; risk: string; level: string }[];
    ghrelin: number; glp1: number;
    opTime: number; hospStay: number; mortality: number; revisionNeed: number; regain: number;
}> = {
    sleeve: {
        summary: 'Laparoscopic Sleeve Gastrectomy: Approximately 80% of the stomach is resected along the greater curvature using a vertical staple line, leaving a narrow tubular gastric sleeve (~100–150 mL). The pylorus and vagus nerve are preserved, maintaining normal gastric emptying.',
        volPre: 1000, volPost: 120,
        diabRemission: 60, htnImprovement: 52,
        nutrients: [
            { nutrient: 'Vitamin B12', risk: 'Moderate', level: '18%' },
            { nutrient: 'Iron', risk: 'Moderate', level: '14%' },
            { nutrient: 'Folate', risk: 'Low', level: '6%' },
            { nutrient: 'Vitamin D', risk: 'Moderate', level: '20%' },
        ],
        ghrelin: 65, glp1: 25,
        opTime: 75, hospStay: 2, mortality: 0.08, revisionNeed: 8, regain: 25,
    },
    bypass: {
        summary: 'Roux-en-Y Gastric Bypass: A small ~30 mL gastric pouch is created from the proximal stomach and connected to a Roux limb (75–150 cm) of the jejunum. The bypassed stomach and duodenum remain in situ. Both restrictive and malabsorptive mechanisms reduce caloric intake and alter gut hormones.',
        volPre: 1000, volPost: 30,
        diabRemission: 83, htnImprovement: 68,
        nutrients: [
            { nutrient: 'Vitamin B12', risk: 'High', level: '37%' },
            { nutrient: 'Iron', risk: 'High', level: '45%' },
            { nutrient: 'Calcium', risk: 'High', level: '30%' },
            { nutrient: 'Vitamin D', risk: 'High', level: '50%' },
            { nutrient: 'Thiamine (B1)', risk: 'Moderate', level: '12%' },
        ],
        ghrelin: 50, glp1: 300,
        opTime: 120, hospStay: 3, mortality: 0.14, revisionNeed: 6, regain: 18,
    },
    bpdds: {
        summary: 'Biliopancreatic Diversion with Duodenal Switch: A vertical sleeve gastrectomy is performed first, then the duodenum is divided distal to the pylorus and anastomosed to the distal ileum (common channel 75–100 cm). Produces the highest sustained weight loss but carries the greatest malabsorptive and nutritional risks.',
        volPre: 1000, volPost: 150,
        diabRemission: 95, htnImprovement: 78,
        nutrients: [
            { nutrient: 'Vitamin A', risk: 'High', level: '52%' },
            { nutrient: 'Vitamin D', risk: 'Very High', level: '63%' },
            { nutrient: 'Vitamin K', risk: 'High', level: '40%' },
            { nutrient: 'Iron', risk: 'High', level: '38%' },
            { nutrient: 'Calcium', risk: 'Very High', level: '55%' },
            { nutrient: 'Protein', risk: 'High', level: '25%' },
            { nutrient: 'Zinc', risk: 'High', level: '30%' },
        ],
        ghrelin: 70, glp1: 350,
        opTime: 180, hospStay: 4, mortality: 0.28, revisionNeed: 5, regain: 12,
    },
    lapband: {
        summary: 'Laparoscopic Adjustable Gastric Banding: An inflatable silicone band is placed around the proximal stomach, creating a small supra-band pouch (~30 mL). Band tightness is adjusted via a subcutaneous port with saline injections. No cutting or stapling of the stomach occurs. This is the least invasive and fully reversible procedure.',
        volPre: 1000, volPost: 700,
        diabRemission: 45, htnImprovement: 35,
        nutrients: [
            { nutrient: 'Vitamin B12', risk: 'Low', level: '4%' },
            { nutrient: 'Iron', risk: 'Low', level: '5%' },
            { nutrient: 'Folate', risk: 'Low', level: '3%' },
        ],
        ghrelin: 10, glp1: 5,
        opTime: 45, hospStay: 1, mortality: 0.03, revisionNeed: 40, regain: 45,
    },
    sadis: {
        summary: 'Single Anastomosis Duodeno-Ileal Bypass with Sleeve Gastrectomy: A sleeve gastrectomy is performed, then the duodenum is divided and anastomosed to a single loop of ileum (~250–300 cm from the ileocecal valve). Simpler than BPD/DS with fewer anastomoses, while preserving significant malabsorptive benefit.',
        volPre: 1000, volPost: 130,
        diabRemission: 88, htnImprovement: 72,
        nutrients: [
            { nutrient: 'Vitamin D', risk: 'High', level: '48%' },
            { nutrient: 'Vitamin A', risk: 'Moderate', level: '28%' },
            { nutrient: 'Iron', risk: 'Moderate', level: '22%' },
            { nutrient: 'Calcium', risk: 'Moderate', level: '25%' },
            { nutrient: 'Protein', risk: 'Moderate', level: '15%' },
        ],
        ghrelin: 60, glp1: 280,
        opTime: 140, hospStay: 3, mortality: 0.18, revisionNeed: 7, regain: 15,
    },
    revisional: {
        summary: 'Revisional Bariatric Procedure: Surgical revision of a prior bariatric operation (e.g. band-to-sleeve, sleeve-to-bypass) due to inadequate weight loss, weight regain, or complications. Involves re-dissection of scarred tissue planes, conversion stapling, and possibly anastomotic reconstruction. Higher technical difficulty and complication rates than primary procedures.',
        volPre: 600, volPost: 100,
        diabRemission: 50, htnImprovement: 40,
        nutrients: [
            { nutrient: 'Vitamin B12', risk: 'Moderate', level: '22%' },
            { nutrient: 'Iron', risk: 'Moderate', level: '20%' },
            { nutrient: 'Vitamin D', risk: 'Moderate', level: '28%' },
            { nutrient: 'Calcium', risk: 'Moderate', level: '18%' },
        ],
        ghrelin: 40, glp1: 100,
        opTime: 160, hospStay: 4, mortality: 0.32, revisionNeed: 12, regain: 32,
    },
};

function computeFEM(surgery: string, staplerHeight: number): ClinicalOutcome {
    const avgThickness = tissueRegions.reduce((a, r) => a + r.thickness, 0) / tissueRegions.length;
    const avgStiffness = tissueRegions.reduce((a, r) => a + r.baseStress, 0) / tissueRegions.length;

    const baseLeakRisk: Record<string, number> = { sleeve: 3.2, bypass: 4.8, bpdds: 5.6, lapband: 0.4, sadis: 4.2, revisional: 6.1 };
    const staplerFactor = surgery === 'lapband' ? 0 : (staplerHeight - 2.5) / 3.0;
    const stiffnessFactor = 1.0 - avgStiffness * 0.28;
    const wallFactor = 1.0 - (avgThickness - 2.0) / 14.0;
    const leakRisk = (baseLeakRisk[surgery] ?? 3.5) * stiffnessFactor * (1 + staplerFactor * 0.38) * wallFactor;
    const regionStress = tissueRegions.map(r => r.baseStress * stiffnessFactor * (1 + staplerFactor * 0.25));
    const maxStressMPa = Math.max(...regionStress) * 58;

    const volReductionMap: Record<string, number> = { sleeve: 74, bypass: 92, bpdds: 88, lapband: 30, sadis: 82, revisional: 70 };
    const recoveryMap: Record<string, number> = { sleeve: 14, bypass: 21, bpdds: 28, lapband: 7, sadis: 21, revisional: 24 };
    const predictedBMIMap: Record<string, number> = { sleeve: 28.5, bypass: 26.2, bpdds: 24.8, lapband: 31.0, sadis: 25.5, revisional: 29.0 };
    const ewlMap: Record<string, number> = { sleeve: 62, bypass: 72, bpdds: 78, lapband: 45, sadis: 70, revisional: 52 };

    const volReduction = volReductionMap[surgery] ?? 68;
    const recovery = recoveryMap[surgery] ?? 18;
    const successRate = Math.max(82, Math.min(98, 96 - leakRisk * 2.5 - (maxStressMPa > 50 ? 3 : 0)));
    const complicationRisk = Math.max(1, Math.min(18, leakRisk * 1.8 + (maxStressMPa > 50 ? 2 : 0)));
    const predictedBMI = predictedBMIMap[surgery] ?? 29.8;
    const excessWeightLoss = ewlMap[surgery] ?? 55;

    const profile = clinicalProfiles[surgery] ?? clinicalProfiles.sleeve;

    return {
        leakRisk: +leakRisk.toFixed(1), maxStress: +maxStressMPa.toFixed(1),
        volReduction, recovery, regionStress,
        successRate: +successRate.toFixed(1), complicationRisk: +complicationRisk.toFixed(1),
        predictedBMI, excessWeightLoss,
        procedureSummary: profile.summary,
        stomachVolumePreOp: profile.volPre, stomachVolumePostOp: profile.volPost,
        diabetesRemission: profile.diabRemission, hypertensionImprovement: profile.htnImprovement,
        nutritionalDeficiencies: profile.nutrients,
        ghrelinReduction: profile.ghrelin, glp1Change: profile.glp1,
        operativeTime: profile.opTime, hospitalStay: profile.hospStay,
        mortalityRate30Day: profile.mortality, revisionalNeed5Year: profile.revisionNeed,
        weightRegain5Year: profile.regain,
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
                                <div className="mt-1 h-2 w-40 bg-gradient-to-r from-[#0ea5e9] via-[#22c55e] via-[#eab308] to-[#dc2626]" />
                                <div className="mt-1 flex justify-between text-[10px] text-[#b7b7b9]"><span>Low</span><span>High</span></div>
                            </div>
                        )}
                        {showThickness && (
                            <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-white/20 bg-black/70 px-3 py-2">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#78808d]">Wall Thickness</p>
                                <div className="mt-1 h-2 w-40 bg-gradient-to-r from-[#2563eb] via-[#06b6d4] via-[#16a34a] to-[#ea580c]" />
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
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-t border-white/10 bg-[#090909] p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Outcome verdict */}
                            <div className="flex items-center gap-3">
                                {femResult.successRate >= 90 ? (
                                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="h-6 w-6 flex-shrink-0 text-yellow-400" />
                                )}
                                <div>
                                    <p className="text-lg font-bold text-[#f0dbbe]">
                                        {femResult.successRate >= 90 ? 'Favourable Outcome Predicted' : 'Moderate Risk Detected'}
                                    </p>
                                    <p className="text-xs text-[#8b8f98]">
                                        Based on patient tissue profile, {surgeryTypes.find(s => s.id === selectedSurgery)?.name}{selectedSurgery !== 'lapband' ? ` with ${selectedStapler.name} stapler` : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Clinical Summary */}
                            <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[#6f7480] mb-2">Clinical Procedure Summary</p>
                                <p className="text-[12px] leading-5 text-[#c9c9cb]">{femResult.procedureSummary}</p>
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

                            {/* Biomechanical row */}
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

                            {/* Stomach Volume */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Pre-Op Volume</p>
                                    <p className="mt-1 text-lg font-bold text-[#f0dbbe]">{femResult.stomachVolumePreOp} <span className="text-xs font-normal text-[#8b8f98]">mL</span></p>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Post-Op Volume</p>
                                    <p className="mt-1 text-lg font-bold text-emerald-400">{femResult.stomachVolumePostOp} <span className="text-xs font-normal text-[#8b8f98]">mL</span></p>
                                    <div className="mt-1 h-1.5 w-full rounded bg-white/10"><div className="h-full rounded bg-emerald-500/60" style={{ width: `${(femResult.stomachVolumePostOp / femResult.stomachVolumePreOp) * 100}%` }} /></div>
                                </div>
                            </div>

                            {/* Metabolic Impact */}
                            <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[#6f7480] mb-2">Metabolic Impact</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">T2 Diabetes Remission</p>
                                        <p className="text-lg font-bold text-emerald-400">{femResult.diabetesRemission}%</p>
                                        <div className="mt-1 h-1.5 w-full rounded bg-white/10"><div className="h-full rounded bg-emerald-500/60" style={{ width: `${femResult.diabetesRemission}%` }} /></div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">Hypertension Improvement</p>
                                        <p className="text-lg font-bold text-[#86b8ff]">{femResult.hypertensionImprovement}%</p>
                                        <div className="mt-1 h-1.5 w-full rounded bg-white/10"><div className="h-full rounded bg-blue-500/60" style={{ width: `${femResult.hypertensionImprovement}%` }} /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Hormonal Changes */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">Ghrelin Reduction</p>
                                    <p className="mt-1 text-lg font-bold text-[#f0dbbe]">↓ {femResult.ghrelinReduction}%</p>
                                    <p className="text-[10px] text-[#8b8f98]">Appetite suppression</p>
                                </div>
                                <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                    <p className="text-[9px] uppercase tracking-wider text-[#6f7480]">GLP-1 Change</p>
                                    <p className="mt-1 text-lg font-bold text-emerald-400">↑ {femResult.glp1Change}%</p>
                                    <p className="text-[10px] text-[#8b8f98]">Insulin sensitivity</p>
                                </div>
                            </div>

                            {/* Nutritional Deficiency Risks */}
                            <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[#6f7480] mb-2">Nutritional Deficiency Risk Profile</p>
                                <div className="space-y-1.5">
                                    {femResult.nutritionalDeficiencies.map((d, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <span className="text-[#c9c9cb]">{d.nutrient}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#8b8f98]">{d.level}</span>
                                                <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase ${
                                                    d.risk === 'Low' ? 'bg-emerald-600/20 text-emerald-400' :
                                                    d.risk === 'Moderate' ? 'bg-yellow-600/20 text-yellow-400' :
                                                    d.risk === 'High' ? 'bg-orange-600/20 text-orange-400' :
                                                    'bg-red-600/20 text-red-400'
                                                }`}>{d.risk}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Operative Details */}
                            <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[#6f7480] mb-2">Operative Details</p>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">Op Time</p>
                                        <p className="text-sm font-bold text-[#f0dbbe]">{femResult.operativeTime}<span className="text-[10px] font-normal text-[#8b8f98]"> min</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">Hospital Stay</p>
                                        <p className="text-sm font-bold text-[#f0dbbe]">{femResult.hospitalStay}<span className="text-[10px] font-normal text-[#8b8f98]"> days</span></p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">30-Day Mortality</p>
                                        <p className="text-sm font-bold text-[#f0dbbe]">{femResult.mortalityRate30Day}%</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">5yr Revision</p>
                                        <p className="text-sm font-bold text-[#f0dbbe]">{femResult.revisionalNeed5Year}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Long-term Prognosis */}
                            <div className="border border-white/10 bg-[#0d0d0d] p-3">
                                <p className="text-[9px] uppercase tracking-[0.16em] text-[#6f7480] mb-2">Long-Term Prognosis (5-Year)</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-[#8b8f98]">Weight Regain Probability</p>
                                        <p className="text-lg font-bold text-[#f0dbbe]">{femResult.weightRegain5Year}%</p>
                                    </div>
                                    <div className="w-32">
                                        <div className="h-2 w-full rounded bg-white/10">
                                            <div className={`h-full rounded ${femResult.weightRegain5Year < 20 ? 'bg-emerald-500/70' : femResult.weightRegain5Year < 35 ? 'bg-yellow-500/70' : 'bg-red-500/70'}`} style={{ width: `${femResult.weightRegain5Year}%` }} />
                                        </div>
                                        <div className="flex justify-between text-[8px] text-[#6f7480] mt-0.5"><span>Low</span><span>High</span></div>
                                    </div>
                                </div>
                            </div>

                            <Link href={`/results?patientId=${patientId}&patientName=${patientName}&surgery=${selectedSurgery}&stapler=${selectedStapler.id}`} className="flex h-10 w-full items-center justify-center gap-1 border border-[#f0dfc6] bg-[#f0dfc6] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#e7d1b4]">
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
