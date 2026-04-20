'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    Database,
    Download,
    Upload,
    Search,
    Clock,
    HardDrive,
    FileText,
} from 'lucide-react';

const datasets = [
    { name: 'Gastric Wall Properties', records: 1200, size: '2.4 GB', updated: '2024-01-15', format: 'CSV', desc: 'Tissue biomechanical properties from literature and clinical data' },
    { name: 'CT Scan Archive', records: 3400, size: '89 GB', updated: '2024-01-14', format: 'DICOM', desc: 'Anonymized abdominal CT scans for training segmentation models' },
    { name: 'Simulation Results', records: 5600, size: '4.2 GB', updated: '2024-01-15', format: 'JSON', desc: 'Historical FEM simulation outputs and validated results' },
    { name: 'Stapler Specifications', records: 45, size: '12 MB', updated: '2024-01-10', format: 'CSV', desc: 'Stapler cartridge specifications including height and tissue ranges' },
    { name: 'Patient Outcomes', records: 890, size: '340 MB', updated: '2024-01-08', format: 'CSV', desc: 'Post-operative outcomes for model validation and risk prediction' },
    { name: 'Material Constants', records: 120, size: '2 MB', updated: '2023-12-20', format: 'JSON', desc: 'Hyperelastic material constants for biological tissues' },
];

export default function DatasetsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = datasets.filter(
        (d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Datasets</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>
                        Manage training data, simulation parameters, and clinical records.
                    </p>
                </div>
                <button className="np-nav-btn np-nav-btn--primary flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload Dataset
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                    type="text"
                    placeholder="Search datasets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="np-input pl-10"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="page-glass !p-4">
                    <div className="text-sm text-[#94a3b8] flex items-center gap-2"><Database className="w-4 h-4" /> Total Datasets</div>
                    <div className="text-2xl font-bold text-blue-400 mt-1">{datasets.length}</div>
                </div>
                <div className="page-glass !p-4">
                    <div className="text-sm text-[#94a3b8] flex items-center gap-2"><FileText className="w-4 h-4" /> Total Records</div>
                    <div className="text-2xl font-bold text-purple-400 mt-1">{datasets.reduce((s, d) => s + d.records, 0).toLocaleString()}</div>
                </div>
                <div className="page-glass !p-4">
                    <div className="text-sm text-[#94a3b8] flex items-center gap-2"><HardDrive className="w-4 h-4" /> Total Size</div>
                    <div className="text-2xl font-bold text-green-400 mt-1">~96 GB</div>
                </div>
            </div>

            {/* Dataset list */}
            <div className="space-y-4">
                {filtered.map((ds, idx) => (
                    <motion.div
                        key={ds.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="page-glass"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Database className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="font-semibold text-white">{ds.name}</div>
                                    <div className="text-sm text-[#94a3b8] mt-0.5">{ds.desc}</div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-[#64748b]">
                                        <span>{ds.records.toLocaleString()} records</span>
                                        <span>{ds.size}</span>
                                        <span className="px-2 py-0.5 rounded bg-white/5 text-[#cbd5e1] text-xs font-mono">{ds.format}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ds.updated}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 rounded-lg text-[#94a3b8] hover:text-white transition-colors flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.08)' }} title="Download">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-[#64748b]">
                        <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No datasets match your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}
