'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Brain,
    Activity,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Play,
    Upload,
    FileImage,
} from 'lucide-react';

const analysisModules = [
    { name: 'Stomach Segmentation', desc: 'Auto-segment stomach regions from CT/MRI scans', model: 'SegNet v3.2', accuracy: '96.8%', status: 'ready' },
    { name: 'Tissue Classification', desc: 'Identify tissue types and wall thickness distribution', model: 'TissueNet v1.8', accuracy: '92.5%', status: 'ready' },
    { name: 'Risk Prediction', desc: 'Predict post-operative leak risk and complications', model: 'RiskNet v2.1', accuracy: '94.2%', status: 'ready' },
    { name: 'Staple Line Analysis', desc: 'Evaluate staple line integrity and compression', model: 'StapleNet v1.0', accuracy: '91.0%', status: 'beta' },
];

export default function AIAnalysisPage() {
    const [running, setRunning] = useState<string | null>(null);
    const [completed, setCompleted] = useState<Set<string>>(new Set());

    const runAnalysis = (name: string) => {
        setRunning(name);
        setTimeout(() => {
            setRunning(null);
            setCompleted((prev) => new Set(prev).add(name));
        }, 3000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <h1 className="page-title">AI Analysis</h1>
            <p className="page-subtitle">
                Run AI-powered analysis modules on patient scan data for segmentation, classification, and risk assessment.
            </p>

            {/* Quick upload prompt */}
            <div className="page-glass flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                    <div className="font-medium text-white">Select scan data</div>
                    <div className="text-sm text-[#64748b]">Upload or select existing patient scans to run analysis</div>
                </div>
                <Link href="/upload" className="np-nav-btn np-nav-btn--secondary flex items-center gap-2 text-sm">
                    <FileImage className="w-4 h-4" /> Upload Scans
                </Link>
            </div>

            {/* Analysis Modules */}
            <div className="space-y-4">
                {analysisModules.map((mod, idx) => {
                    const isRunning = running === mod.name;
                    const isDone = completed.has(mod.name);
                    return (
                        <motion.div
                            key={mod.name}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="page-glass"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Brain className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white flex items-center gap-2">
                                            {mod.name}
                                            {mod.status === 'beta' && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">Beta</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-[#94a3b8] mt-0.5">{mod.desc}</div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-[#64748b]">
                                            <span>Model: {mod.model}</span>
                                            <span>Accuracy: <span className="text-green-400">{mod.accuracy}</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                    {isDone ? (
                                        <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                                            <CheckCircle className="w-4 h-4" /> Complete
                                        </span>
                                    ) : isRunning ? (
                                        <span className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                                            <Loader2 className="w-4 h-4 animate-spin" /> Running...
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => runAnalysis(mod.name)}
                                            className="np-nav-btn np-nav-btn--primary flex items-center gap-2 text-sm"
                                        >
                                            <Play className="w-4 h-4" /> Run
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
