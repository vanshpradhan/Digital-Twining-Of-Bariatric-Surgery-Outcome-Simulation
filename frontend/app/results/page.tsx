'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
    AlertTriangle,
    CheckCircle,
    Download,
    Share2,
    Printer,
    TrendingDown,
    Activity,
    Loader2,
    Eye,
    EyeOff,
    ArrowLeft,
    User,
    Home,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StomachViewer = dynamic(
    () => import('@/components/three/StomachViewer'),
    { ssr: false, loading: () => <div className="flex items-center justify-center" style={{ height: 256 }}><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div> }
);

const stressData = [
    { region: 'Fundus', stress: 32, threshold: 50 },
    { region: 'Body', stress: 45, threshold: 50 },
    { region: 'Antrum', stress: 28, threshold: 50 },
    { region: 'Staple Line', stress: 48, threshold: 50 },
];

const riskBreakdown = [
    { name: 'Tissue Quality', value: 25, color: '#22c55e' },
    { name: 'Compression', value: 35, color: '#f59e0b' },
    { name: 'Stapler Fit', value: 20, color: '#3b82f6' },
    { name: 'Patient Factors', value: 20, color: '#8b5cf6' },
];

const recommendations = [
    { type: 'success', text: 'Stapler selection is appropriate for tissue thickness' },
    { type: 'info', text: 'Consider reinforcing staple line with buttress material' },
    { type: 'warning', text: 'Monitor high-stress area in body region' },
    { type: 'success', text: 'Overall leak risk is within acceptable limits' },
];

function ResultsContent() {
    const searchParams = useSearchParams();
    const patientName = searchParams.get('patientName') || 'John Smith';
    const patientId = searchParams.get('patientId') || '';
    const [showDetailed, setShowDetailed] = useState(false);

    const leakRisk = 12.5;
    const maxStress = 48.2;
    const compressionRatio = 0.72;

    return (
        <div className="space-y-6">
            {/* Back */}
            <div className="flex items-center gap-4">
                <Link href={`/simulation?patientId=${patientId}&patientName=${patientName}`} className="page-back" style={{ marginBottom: 0 }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Simulation
                </Link>
                <Link href="/" className="page-back" style={{ marginBottom: 0 }}>
                    <Home className="w-4 h-4" /> Home
                </Link>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title" style={{ marginBottom: 4 }}>Simulation Results</h1>
                    <p className="text-[#94a3b8] flex items-center gap-1 text-sm">
                        <User className="w-3.5 h-3.5" />
                        Patient: {decodeURIComponent(patientName)} • Simulation #SIM-2024-001
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="np-nav-btn np-nav-btn--secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="np-nav-btn np-nav-btn--secondary flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button className="np-nav-btn np-nav-btn--primary flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print Report
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="page-glass"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Leak Risk</span>
                        {leakRisk < 20 ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                    </div>
                    <div className="text-3xl font-bold text-green-400">{leakRisk}%</div>
                    <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                        <TrendingDown className="w-4 h-4" />
                        Low risk
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="page-glass"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Max Stress</span>
                        <Activity className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-3xl font-bold text-amber-400">{maxStress} MPa</div>
                    <div className="text-sm text-[#64748b] mt-1">Below threshold (50 MPa)</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="page-glass"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Compression Ratio</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-400">{(compressionRatio * 100).toFixed(0)}%</div>
                    <div className="text-sm text-[#64748b] mt-1">Optimal range (60-80%)</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="page-glass"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[#94a3b8]">Recommended Stapler</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-blue-400">Blue</div>
                    <div className="text-sm text-[#64748b] mt-1">Linear 3.5mm</div>
                </motion.div>
            </div>

            {/* 3D Visualization */}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 page-glass">
                    <h3 className="font-semibold mb-4 text-white">Stress Visualization</h3>
                    <div style={{ height: 320 }}>
                        <StomachViewer showStress={true} showStapleLine={true} />
                    </div>
                    <div className="mt-4 p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm text-[#cbd5e1]">Low Stress</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-sm text-[#cbd5e1]">Medium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm text-[#cbd5e1]">High Stress</span>
                            </div>
                        </div>
                        <span className="text-sm text-[#64748b]">Drag to rotate • Scroll to zoom</span>
                    </div>
                </div>

                {/* Risk Breakdown */}
                <div className="page-glass">
                    <h3 className="font-semibold mb-4 text-white">Risk Factor Breakdown</h3>
                    <div style={{ height: 192 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={riskBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {riskBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                        {riskBreakdown.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-[#cbd5e1]">{item.name}</span>
                                </div>
                                <span className="text-sm font-medium text-white">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Detailed Results Toggle */}
            <div className="flex justify-center">
                <button
                    onClick={() => setShowDetailed(!showDetailed)}
                    className="np-nav-btn np-nav-btn--primary flex items-center gap-2 !px-6 !py-3"
                >
                    {showDetailed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showDetailed ? 'Hide Detailed Results' : 'View Detailed Results'}
                </button>
            </div>

            {/* Detailed Results (toggled) */}
            {showDetailed && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                >
                    {/* Stress by Region Chart */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white">Stress by Region</h3>
                        <div style={{ height: 256 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stressData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                                    <XAxis dataKey="region" stroke="#a0a0a0" />
                                    <YAxis stroke="#a0a0a0" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #2a2a2a' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="stress"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="threshold"
                                        stroke="#ef4444"
                                        fill="none"
                                        strokeDasharray="5 5"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white">Surgical Recommendations</h3>
                        <div className="space-y-3">
                            {recommendations.map((rec, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-4 rounded-lg"
                                    style={{
                                        background: rec.type === 'success' ? 'rgba(34,197,94,0.08)' :
                                            rec.type === 'warning' ? 'rgba(245,158,11,0.08)' :
                                                'rgba(59,130,246,0.08)'
                                    }}
                                >
                                    {rec.type === 'success' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                                    {rec.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                                    {rec.type === 'info' && <Activity className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                                    <span className="text-[#cbd5e1]">{rec.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center" style={{ minHeight: '60vh' }}><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}>
            <ResultsContent />
        </Suspense>
    );
}
