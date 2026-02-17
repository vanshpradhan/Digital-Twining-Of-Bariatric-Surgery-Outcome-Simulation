'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Server,
    Database,
    Brain,
    FileText,
    Settings,
    Users,
    Activity,
    Clock,
    TrendingUp,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';

const tabItems = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'datasets', label: 'Datasets', icon: Database },
    { key: 'models', label: 'AI Models', icon: Brain },
    { key: 'logs', label: 'System Logs', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
];

const systemStats = [
    { label: 'Active Patients', value: 157, icon: Users, color: '#3b82f6' },
    { label: 'Total Simulations', value: 1249, icon: Activity, color: '#8b5cf6' },
    { label: 'Models Trained', value: 12, icon: Brain, color: '#22c55e' },
    { label: 'Server Uptime', value: '99.9%', icon: Server, color: '#f59e0b' },
];

const recentActivity = [
    { time: '2 min ago', event: 'Simulation completed for P-2024-001', type: 'success' },
    { time: '15 min ago', event: 'New dataset uploaded: gastric_wall_v2', type: 'info' },
    { time: '1 hr ago', event: 'Model retrained: segmentation_v3.2', type: 'info' },
    { time: '3 hr ago', event: 'High memory usage detected (92%)', type: 'warning' },
    { time: '5 hr ago', event: 'New patient registered: P-2024-006', type: 'info' },
];

const datasets = [
    { name: 'Gastric Wall Properties', records: 1200, lastUpdated: '2024-01-15', size: '2.4 GB' },
    { name: 'CT Scan Archive', records: 3400, lastUpdated: '2024-01-14', size: '89 GB' },
    { name: 'Simulation Results', records: 5600, lastUpdated: '2024-01-15', size: '4.2 GB' },
    { name: 'Stapler Specifications', records: 45, lastUpdated: '2024-01-10', size: '12 MB' },
];

const aiModels = [
    { name: 'Stomach Segmentation v3.2', accuracy: '96.8%', status: 'active', lastTrained: '2024-01-12' },
    { name: 'Risk Prediction v2.1', accuracy: '94.2%', status: 'active', lastTrained: '2024-01-10' },
    { name: 'Tissue Classification v1.8', accuracy: '92.5%', status: 'inactive', lastTrained: '2023-12-28' },
];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <h1 className="page-title">Administration</h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
                System management, datasets, AI models, and logs
            </p>

            {/* Tabs */}
            <div className="flex gap-2">
                {tabItems.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: activeTab === key ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                            border: activeTab === key ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.06)',
                            color: activeTab === key ? '#93c5fd' : '#94a3b8',
                        }}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                        {systemStats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="page-glass"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                                    <span className="text-sm text-[#94a3b8]">{stat.label}</span>
                                </div>
                                <div className="text-3xl font-bold text-white">{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="page-glass">
                        <h3 className="font-semibold mb-4 text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#64748b]" /> Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {recentActivity.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ background: 'rgba(255,255,255,0.03)' }}
                                >
                                    {item.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                    {item.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                                    <span className="text-[#cbd5e1] flex-1">{item.event}</span>
                                    <span className="text-sm text-[#64748b]">{item.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Datasets */}
            {activeTab === 'datasets' && (
                <div className="page-glass !p-0">
                    <table className="w-full">
                        <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
                            <tr>
                                <th className="text-left p-4 font-medium text-[#94a3b8]">Dataset Name</th>
                                <th className="text-left p-4 font-medium text-[#94a3b8]">Records</th>
                                <th className="text-left p-4 font-medium text-[#94a3b8]">Size</th>
                                <th className="text-left p-4 font-medium text-[#94a3b8]">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datasets.map((ds, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.03]" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                    <td className="p-4 font-medium text-white">{ds.name}</td>
                                    <td className="p-4 text-[#94a3b8]">{ds.records.toLocaleString()}</td>
                                    <td className="p-4 text-[#94a3b8]">{ds.size}</td>
                                    <td className="p-4 text-[#64748b]">{ds.lastUpdated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* AI Models */}
            {activeTab === 'models' && (
                <div className="space-y-4">
                    {aiModels.map((model, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="page-glass"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-white">{model.name}</div>
                                    <div className="text-sm text-[#64748b] mt-1">Last trained: {model.lastTrained}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-[#94a3b8]">Accuracy</div>
                                        <div className="font-bold text-green-400">{model.accuracy}</div>
                                    </div>
                                    <span
                                        className="text-xs px-3 py-1 rounded-full font-medium"
                                        style={{
                                            background: model.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                            color: model.status === 'active' ? '#4ade80' : '#f87171',
                                        }}
                                    >
                                        {model.status}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Logs */}
            {activeTab === 'logs' && (
                <div className="page-glass font-mono text-sm" style={{ maxHeight: 400, overflowY: 'auto' }}>
                    {[
                        '[2024-01-15 14:32:01] INFO  Server started on port 8000',
                        '[2024-01-15 14:32:05] INFO  Database connection established',
                        '[2024-01-15 14:35:12] INFO  Processing simulation request SIM-2024-001',
                        '[2024-01-15 14:35:45] WARN  High memory usage: 89%',
                        '[2024-01-15 14:36:01] INFO  Simulation SIM-2024-001 completed successfully',
                        '[2024-01-15 14:40:22] INFO  Model inference: segmentation_v3.2',
                        '[2024-01-15 14:42:10] INFO  File upload: gastric_wall_v2.csv (2.4GB)',
                        '[2024-01-15 14:45:00] WARN  CPU temperature: 78°C',
                    ].map((line, i) => (
                        <div key={i} className="py-1" style={{ color: line.includes('WARN') ? '#f59e0b' : line.includes('ERROR') ? '#ef4444' : '#94a3b8' }}>
                            {line}
                        </div>
                    ))}
                </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
                <div className="page-glass space-y-6">
                    <div>
                        <h3 className="font-semibold mb-4 text-white">System Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="np-label">Server Port</label>
                                <input type="text" defaultValue="8000" className="np-input mt-1" />
                            </div>
                            <div>
                                <label className="np-label">Max Concurrent Simulations</label>
                                <input type="number" defaultValue="4" className="np-input mt-1" />
                            </div>
                            <div>
                                <label className="np-label">Auto-save Interval (min)</label>
                                <input type="number" defaultValue="5" className="np-input mt-1" />
                            </div>
                            <div>
                                <label className="np-label">Log Level</label>
                                <select className="np-input mt-1">
                                    <option>INFO</option>
                                    <option>DEBUG</option>
                                    <option>WARN</option>
                                    <option>ERROR</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button className="np-nav-btn np-nav-btn--primary">Save Settings</button>
                    </div>
                </div>
            )}
        </div>
    );
}
