'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User,
    Plus,
    Search,
    Filter,
    FileImage,
    Activity,
    Clock,
    ChevronRight,
    ArrowLeft,
} from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    mrn: string;
    age: number;
    gender: string;
    lastScan: string;
    scanCount: number;
    simulationCount: number;
    status: 'pending' | 'active' | 'completed';
}

const mockPatients: Patient[] = [
    { id: '1', name: 'John Smith', mrn: 'P-2024-001', age: 45, gender: 'Male', lastScan: '2024-01-15', scanCount: 3, simulationCount: 2, status: 'active' },
    { id: '2', name: 'Sarah Johnson', mrn: 'P-2024-002', age: 52, gender: 'Female', lastScan: '2024-01-14', scanCount: 2, simulationCount: 1, status: 'completed' },
    { id: '3', name: 'Michael Brown', mrn: 'P-2024-003', age: 38, gender: 'Male', lastScan: '2024-01-13', scanCount: 1, simulationCount: 0, status: 'pending' },
    { id: '4', name: 'Emily Davis', mrn: 'P-2024-004', age: 61, gender: 'Female', lastScan: '2024-01-12', scanCount: 4, simulationCount: 3, status: 'completed' },
    { id: '5', name: 'Robert Wilson', mrn: 'P-2024-005', age: 49, gender: 'Male', lastScan: '2024-01-11', scanCount: 2, simulationCount: 1, status: 'active' },
];

export default function PatientsPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>(mockPatients);

    // Load patients from localStorage on mount
    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('dt-patients') || '[]');
            if (stored.length > 0) {
                setPatients([...mockPatients, ...stored]);
            }
        } catch {
            // ignore
        }
    }, []);

    const filteredPatients = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: Patient['status']) => {
        switch (status) {
            case 'active':
                return <span className="badge-info">Active</span>;
            case 'completed':
                return <span className="badge-success">Completed</span>;
            case 'pending':
                return <span className="badge-warning">Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Back */}
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-title">Existing Patients</h1>
                    <p className="page-subtitle" style={{ marginBottom: 0 }}>Select a patient to view details or proceed with simulation</p>
                </div>
                <Link href="/new-patient" className="np-nav-btn np-nav-btn--primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New Patient
                </Link>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                    <input
                        type="text"
                        placeholder="Search patients by name or MRN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="np-input pl-10"
                    />
                </div>
                <button className="np-nav-btn np-nav-btn--secondary flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="page-glass !p-4">
                    <div className="text-2xl font-bold text-blue-400">{patients.length}</div>
                    <div className="text-sm text-[#94a3b8]">Total Patients</div>
                </div>
                <div className="page-glass !p-4">
                    <div className="text-2xl font-bold text-cyan-400">
                        {patients.filter((p) => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-[#94a3b8]">Active Cases</div>
                </div>
                <div className="page-glass !p-4">
                    <div className="text-2xl font-bold text-green-400">
                        {patients.filter((p) => p.status === 'completed').length}
                    </div>
                    <div className="text-sm text-[#94a3b8]">Completed</div>
                </div>
                <div className="page-glass !p-4">
                    <div className="text-2xl font-bold text-amber-400">
                        {patients.filter((p) => p.status === 'pending').length}
                    </div>
                    <div className="text-sm text-[#94a3b8]">Pending</div>
                </div>
            </div>

            {/* Patient List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-glass !p-0 overflow-hidden"
            >
                <table className="w-full">
                    <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <tr>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">Patient</th>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">MRN</th>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">Age/Gender</th>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">Scans</th>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">Simulations</th>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">Status</th>
                            <th className="text-left p-4 font-medium text-[#94a3b8]">Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {filteredPatients.map((patient, index) => (
                            <motion.tr
                                key={patient.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                onClick={() => router.push(`/patients/${patient.id}`)}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{patient.name}</div>
                                            <div className="text-sm text-[#64748b] flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Last scan: {patient.lastScan}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-sm text-[#94a3b8]">{patient.mrn}</td>
                                <td className="p-4 text-[#cbd5e1]">
                                    {patient.age}y / {patient.gender}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-[#94a3b8]">
                                        <FileImage className="w-4 h-4" />
                                        {patient.scanCount}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-[#94a3b8]">
                                        <Activity className="w-4 h-4" />
                                        {patient.simulationCount}
                                    </div>
                                </td>
                                <td className="p-4">{getStatusBadge(patient.status)}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <span className="np-nav-btn np-nav-btn--secondary text-sm !px-3 !py-1 flex items-center gap-1">
                                            View <ChevronRight className="w-3 h-3" />
                                        </span>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filteredPatients.length === 0 && (
                    <div className="p-12 text-center text-[#64748b]">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No patients found</p>
                        <p className="text-sm mt-1">Try a different search or add a new patient</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
