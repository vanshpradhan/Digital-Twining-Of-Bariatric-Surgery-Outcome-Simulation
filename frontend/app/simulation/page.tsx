'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    Play,
    RotateCcw,
    Settings,
    Layers,
    Eye,
    EyeOff,
    Loader2,
    AlertTriangle,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    User,
} from 'lucide-react';

const StomachViewer = dynamic(
    () => import('@/components/three/StomachViewer'),
    { ssr: false, loading: () => <div className="flex items-center justify-center" style={{ height: 400 }}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div> }
);

const staplerTypes = [
    { id: 'linear_white', name: 'Linear White', height: 2.5, tissue: '1.0-1.5mm' },
    { id: 'linear_blue', name: 'Linear Blue', height: 3.5, tissue: '1.5-2.0mm' },
    { id: 'linear_gold', name: 'Linear Gold', height: 3.8, tissue: '1.8-2.5mm' },
    { id: 'linear_green', name: 'Linear Green', height: 4.8, tissue: '2.0-3.0mm' },
    { id: 'linear_black', name: 'Linear Black', height: 5.5, tissue: '3.0-4.0mm' },
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

    const leakRisk = simulationComplete ? 12.5 : null;
    const maxStress = simulationComplete ? 45.2 : null;

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link href={patientId ? `/patients/${patientId}` : '/patients'} className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Patient
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title" style={{ marginBottom: 4 }}>FEM Simulation</h1>
                    {patientName && (
                        <p className="text-[#94a3b8] text-sm flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            Patient: {decodeURIComponent(patientName)}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowWireframe(!showWireframe)}
                        className={`p-2 rounded-lg transition-colors ${showWireframe ? 'bg-blue-500/20 text-blue-400' : 'text-[#94a3b8] hover:text-white'}`}
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        title="Toggle wireframe"
                    >
                        <Layers className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowStress(!showStress)}
                        className={`p-2 rounded-lg transition-colors ${showStress ? 'bg-blue-500/20 text-blue-400' : 'text-[#94a3b8] hover:text-white'}`}
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        title="Toggle stress visualization"
                    >
                        {showStress ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="flex gap-6">
                {/* 3D Viewer Panel */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* 3D Viewer */}
                    <div className="page-glass" style={{ minHeight: 400, padding: 0, overflow: 'hidden' }}>
                        <StomachViewer
                            showStress={showStress}
                            showStapleLine={showStapleLine}
                            wireframe={showWireframe}
                            className="h-full"
                        />
                    </div>

                    {/* Progress Bar */}
                    {isRunning && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="page-glass"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-white">Running Simulation...</span>
                                <span className="text-sm text-blue-400">{progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Results Summary */}
                    {simulationComplete && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-3 gap-4">
                                <div className="page-glass">
                                    <div className="flex items-center gap-2 mb-2">
                                        {leakRisk && leakRisk < 20 ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                        )}
                                        <span className="text-sm text-[#94a3b8]">Leak Risk</span>
                                    </div>
                                    <div className="text-2xl font-bold text-green-400">{leakRisk}%</div>
                                </div>
                                <div className="page-glass">
                                    <span className="text-sm text-[#94a3b8]">Max Stress</span>
                                    <div className="text-2xl font-bold text-amber-400">{maxStress} MPa</div>
                                </div>
                                <div className="page-glass">
                                    <span className="text-sm text-[#94a3b8]">Status</span>
                                    <div className="text-2xl font-bold text-blue-400">Safe</div>
                                </div>
                            </div>

                            {/* View Detailed Results Button */}
                            <Link
                                href={`/results?patientId=${patientId}&patientName=${patientName}`}
                                className="w-full np-nav-btn np-nav-btn--primary flex items-center justify-center gap-2 !py-3"
                            >
                                View Detailed Results
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    )}
                </div>

                {/* Control Panel */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Stapler Selection */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
                            <Settings className="w-4 h-4" />
                            Stapler Selection
                        </h3>
                        <div className="space-y-2">
                            {staplerTypes.map((stapler) => (
                                <button
                                    key={stapler.id}
                                    onClick={() => setSelectedStapler(stapler)}
                                    className="w-full p-3 rounded-lg text-left transition-all"
                                    style={{
                                        background: selectedStapler.id === stapler.id ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                                        border: selectedStapler.id === stapler.id ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                        color: selectedStapler.id === stapler.id ? '#93c5fd' : '#cbd5e1',
                                    }}
                                >
                                    <div className="font-medium">{stapler.name}</div>
                                    <div className="text-sm opacity-70">
                                        {stapler.height}mm • {stapler.tissue}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white">Tissue Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-[#94a3b8] mb-2 flex justify-between">
                                    <span>Tissue Stiffness</span>
                                    <span>{params.tissueStiffness}</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={params.tissueStiffness}
                                    onChange={(e) =>
                                        setParams({ ...params, tissueStiffness: parseFloat(e.target.value) })
                                    }
                                    className="w-full accent-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-[#94a3b8] mb-2 flex justify-between">
                                    <span>Wall Thickness (mm)</span>
                                    <span>{params.wallThickness}</span>
                                </label>
                                <input
                                    type="range"
                                    min="2.0"
                                    max="6.0"
                                    step="0.5"
                                    value={params.wallThickness}
                                    onChange={(e) =>
                                        setParams({ ...params, wallThickness: parseFloat(e.target.value) })
                                    }
                                    className="w-full accent-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white">Simulation Control</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={runSimulation}
                                disabled={isRunning}
                                className="flex-1 np-nav-btn np-nav-btn--primary flex items-center justify-center gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        Run
                                    </>
                                )}
                            </button>
                            <button
                                onClick={resetSimulation}
                                className="np-nav-btn np-nav-btn--secondary flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Stress Legend */}
                    {showStress && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="page-glass"
                        >
                            <h3 className="font-semibold mb-3 text-white">Stress Legend</h3>
                            <div className="h-4 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 mb-2" />
                            <div className="flex justify-between text-xs text-[#64748b]">
                                <span>Low (0 MPa)</span>
                                <span>Medium</span>
                                <span>High (50+ MPa)</span>
                            </div>
                        </motion.div>
                    )}
                </div>
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
