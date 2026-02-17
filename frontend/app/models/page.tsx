'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Boxes,
    Eye,
    Download,
    RotateCcw,
    Clock,
    CheckCircle,
} from 'lucide-react';

const models = [
    { id: 1, name: 'Stomach – John Smith', patient: 'P-2024-001', date: '2024-01-15', vertices: '12,482', status: 'ready' },
    { id: 2, name: 'Stomach – Sarah Johnson', patient: 'P-2024-002', date: '2024-01-14', vertices: '11,930', status: 'ready' },
    { id: 3, name: 'Stomach – Michael Brown', patient: 'P-2024-003', date: '2024-01-13', vertices: '—', status: 'processing' },
    { id: 4, name: 'Stomach – Emily Davis', patient: 'P-2024-004', date: '2024-01-12', vertices: '13,105', status: 'ready' },
];

export default function ModelsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <h1 className="page-title">3D Models</h1>
            <p className="page-subtitle">
                View, download, and manage generated 3D anatomical models.
            </p>

            <div className="grid grid-cols-2 gap-4">
                {models.map((model, idx) => (
                    <motion.div
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="page-glass"
                    >
                        {/* placeholder 3D preview */}
                        <div
                            className="rounded-lg mb-4 flex items-center justify-center"
                            style={{ height: 160, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}
                        >
                            <Boxes className="w-12 h-12 text-blue-400 opacity-40" />
                        </div>

                        <h3 className="font-semibold text-white">{model.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-[#94a3b8] mt-1">
                            <span className="font-mono">{model.patient}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{model.date}</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-sm text-[#64748b]">
                                {model.status === 'ready' ? `${model.vertices} vertices` : 'Generating…'}
                            </span>
                            <div className="flex items-center gap-2">
                                {model.status === 'ready' ? (
                                    <>
                                        <button className="p-2 rounded-lg text-[#94a3b8] hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }} title="View"><Eye className="w-4 h-4" /></button>
                                        <button className="p-2 rounded-lg text-[#94a3b8] hover:text-white transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }} title="Download"><Download className="w-4 h-4" /></button>
                                    </>
                                ) : (
                                    <span className="flex items-center gap-1 text-sm text-amber-400">
                                        <RotateCcw className="w-4 h-4 animate-spin" /> Processing
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
