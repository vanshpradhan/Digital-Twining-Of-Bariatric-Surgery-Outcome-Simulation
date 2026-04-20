'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    ArrowLeft,
    User,
    Calendar,
    FileImage,
    Activity,
    Heart,
    Scale,
    Scissors,
    Pill,
    Brain,
    TestTubes,
    Play,
    ChevronRight,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';

interface PatientRecord {
    id: string;
    name: string;
    mrn: string;
    age: number;
    gender: string;
    lastScan: string;
    scanCount: number;
    simulationCount: number;
    status: 'pending' | 'active' | 'completed';
    medicalHistory?: {
        weightHistory: string;
        comorbidities: string;
        surgicalHistory: string;
        medications: string;
        psychosocialHistory: string;
    };
    scans?: Record<string, { name: string; uploaded: boolean }>;
    labTests?: Record<string, string>;
}

const mockPatients: PatientRecord[] = [
    {
        id: '1', name: 'John Smith', mrn: 'P-2024-001', age: 45, gender: 'Male',
        lastScan: '2024-01-15', scanCount: 3, simulationCount: 2, status: 'active',
        medicalHistory: {
            weightHistory: 'BMI 42.5, previous attempts: diet programs, GLP-1 agonists',
            comorbidities: 'Type 2 Diabetes, Hypertension, Obstructive Sleep Apnea',
            surgicalHistory: 'Appendectomy (2010), Cholecystectomy (2018)',
            medications: 'Metformin 1000mg BID, Lisinopril 20mg daily, CPAP nightly',
            psychosocialHistory: 'Motivated for surgical intervention, strong family support',
        },
        scans: {
            'Chest X-ray': { name: 'chest_xray.dcm', uploaded: true },
            'Abdominal Ultrasound': { name: 'abd_us.dcm', uploaded: true },
            'Upper Endoscopy (EGD)': { name: 'egd_report.pdf', uploaded: true },
            'Electrocardiogram (EKG)': { name: '', uploaded: false },
            'Echocardiogram': { name: '', uploaded: false },
        },
        labTests: {
            'CBC (Complete Blood Count)': 'WBC 7.2, Hgb 14.1, Plt 245',
            'CMP (Comprehensive Metabolic Panel)': 'Glucose 142, BUN 18, Creatinine 0.9',
            'Nutritional Panel': 'Vitamin D 28, B12 412, Folate 12.5',
            'Endocrine Tests': 'TSH 2.4, HbA1c 7.8%',
            'Lipid Profile': 'Total Cholesterol 218, LDL 142, HDL 38',
            'Sleep Study Report': 'AHI 32, severe OSA confirmed',
        },
    },
    { id: '2', name: 'Sarah Johnson', mrn: 'P-2024-002', age: 52, gender: 'Female', lastScan: '2024-01-14', scanCount: 2, simulationCount: 1, status: 'completed' },
    { id: '3', name: 'Michael Brown', mrn: 'P-2024-003', age: 38, gender: 'Male', lastScan: '2024-01-13', scanCount: 1, simulationCount: 0, status: 'pending' },
    { id: '4', name: 'Emily Davis', mrn: 'P-2024-004', age: 61, gender: 'Female', lastScan: '2024-01-12', scanCount: 4, simulationCount: 3, status: 'completed' },
    { id: '5', name: 'Robert Wilson', mrn: 'P-2024-005', age: 49, gender: 'Male', lastScan: '2024-01-11', scanCount: 2, simulationCount: 1, status: 'active' },
];

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [patient, setPatient] = useState<PatientRecord | null>(null);

    useEffect(() => {
        const id = params.id as string;

        const found = mockPatients.find((p) => p.id === id);
        if (found) {
            setPatient(found);
            return;
        }

        try {
            const stored = JSON.parse(localStorage.getItem('dt-patients') || '[]');
            const storedPatient = stored.find((p: PatientRecord) => p.id === id);
            if (storedPatient) {
                setPatient(storedPatient);
            }
        } catch {
            // ignore
        }
    }, [params.id]);

    if (!patient) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#64748b] opacity-40" />
                    <p className="text-lg font-medium text-[#94a3b8]">Patient not found</p>
                    <Link href="/patients" className="text-blue-400 text-sm mt-2 inline-block">
                        ← Back to Patients
                    </Link>
                </div>
            </div>
        );
    }

    const statusColor = patient.status === 'active' ? 'text-cyan-400' : patient.status === 'completed' ? 'text-green-400' : 'text-amber-400';
    const historyItems = [
        { key: 'weightHistory', label: 'Weight History', icon: Scale },
        { key: 'comorbidities', label: 'Comorbidities', icon: Heart },
        { key: 'surgicalHistory', label: 'Surgical History', icon: Scissors },
        { key: 'medications', label: 'Current Medications', icon: Pill },
        { key: 'psychosocialHistory', label: 'Psychosocial History', icon: Brain },
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Back */}
            <Link href="/patients" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Patients
            </Link>

            {/* Patient Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-glass"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
                            <div className="flex items-center gap-4 mt-1 text-sm text-[#94a3b8]">
                                <span className="font-mono">{patient.mrn}</span>
                                <span>{patient.age}y / {patient.gender}</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Last scan: {patient.lastScan}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`capitalize font-semibold ${statusColor}`}>{patient.status}</span>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="text-sm text-[#94a3b8] flex items-center gap-2">
                            <FileImage className="w-4 h-4" /> Scans Uploaded
                        </div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">{patient.scanCount}</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="text-sm text-[#94a3b8] flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Simulations
                        </div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">{patient.simulationCount}</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="text-sm text-[#94a3b8] flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Last Activity
                        </div>
                        <div className="text-2xl font-bold text-blue-400 mt-1">{patient.lastScan}</div>
                    </div>
                </div>
            </motion.div>

            {/* Medical History */}
            {patient.medicalHistory && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="page-glass"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <Heart className="w-5 h-5 text-red-400" /> Medical History
                    </h2>
                    <div className="space-y-4">
                        {historyItems.map(({ key, label, icon: Icon }) => {
                            const value = patient.medicalHistory?.[key as keyof typeof patient.medicalHistory];
                            if (!value) return null;
                            return (
                                <div key={key} className="flex gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <Icon className="w-5 h-5 text-[#64748b] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <div className="text-sm font-medium text-white">{label}</div>
                                        <div className="text-sm text-[#94a3b8] mt-0.5">{value}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Scans */}
            {patient.scans && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="page-glass"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <FileImage className="w-5 h-5 text-purple-400" /> Uploaded Scans
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(patient.scans).map(([name, scan]) => (
                            <div
                                key={name}
                                className="flex items-center gap-3 p-3 rounded-lg"
                                style={{
                                    background: scan.uploaded ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
                                    border: scan.uploaded ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                {scan.uploaded ? (
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-[#64748b] flex-shrink-0" />
                                )}
                                <div>
                                    <div className="text-sm font-medium text-white">{name}</div>
                                    <div className="text-xs text-[#64748b]">
                                        {scan.uploaded ? 'Uploaded' : 'Not uploaded'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Lab Tests */}
            {patient.labTests && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="page-glass"
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                        <TestTubes className="w-5 h-5 text-pink-400" /> Lab Test Results
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(patient.labTests).map(([name, result]) => (
                            <div key={name} className="flex gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <Activity className="w-5 h-5 text-[#64748b] mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-white">{name}</div>
                                    <div className="text-sm text-[#94a3b8] mt-0.5">
                                        {result || 'No results entered'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Proceed to Simulation CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center pb-6"
            >
                <button
                    onClick={() => router.push(`/simulation?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`)}
                    className="np-nav-btn np-nav-btn--primary flex items-center gap-3 text-lg !px-8 !py-4"
                >
                    <Play className="w-5 h-5" />
                    Proceed to Simulation
                    <ChevronRight className="w-5 h-5" />
                </button>
            </motion.div>
        </div>
    );
}
