'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    User,
    FileText,
    TestTubes,
    Scale,
    Heart,
    Scissors,
    Pill,
    Brain,
    Stethoscope,
    FileImage,
    Activity,
    Droplets,
    Salad,
    Moon,
    Upload,
    CheckCircle,
    X,
} from 'lucide-react';



/* ────────── step configs ────────── */
const steps = [
    { id: 1, label: 'Patient Info & Medical History', icon: User },
    { id: 2, label: 'Scans & Imaging', icon: FileImage },
    { id: 3, label: 'Lab Tests & Reports', icon: TestTubes },
];

interface ScanFile {
    name: string;
    file: File | null;
    uploaded: boolean;
}

interface PatientForm {
    name: string;
    dob: string;
    gender: string;
    mrn: string;
    weightHistory: string;
    comorbidities: string;
    surgicalHistory: string;
    medications: string;
    psychosocialHistory: string;
    scans: Record<string, ScanFile>;
    labTests: Record<string, string>;
}

const scanCategories = [
    'Chest X-ray',
    'Abdominal Ultrasound',
    'Upper Endoscopy (EGD)',
    'Electrocardiogram (EKG)',
    'Echocardiogram',
];

const labCategories = [
    'CBC (Complete Blood Count)',
    'CMP (Comprehensive Metabolic Panel)',
    'Nutritional Panel',
    'Endocrine Tests',
    'Lipid Profile',
    'Sleep Study Report',
];

const initScans = (): Record<string, ScanFile> => {
    const s: Record<string, ScanFile> = {};
    scanCategories.forEach((c) => (s[c] = { name: '', file: null, uploaded: false }));
    return s;
};

const initLabs = (): Record<string, string> => {
    const l: Record<string, string> = {};
    labCategories.forEach((c) => (l[c] = ''));
    return l;
};

export default function NewPatientPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<PatientForm>({
        name: '',
        dob: '',
        gender: 'Male',
        mrn: `P-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
        weightHistory: '',
        comorbidities: '',
        surgicalHistory: '',
        medications: '',
        psychosocialHistory: '',
        scans: initScans(),
        labTests: initLabs(),
    });

    const updateField = useCallback(
        (field: keyof PatientForm, value: string) => setForm((prev) => ({ ...prev, [field]: value })),
        []
    );

    const next = () => setStep((s) => Math.min(s + 1, 3));
    const prev = () => setStep((s) => Math.max(s - 1, 1));

    const markScanUploaded = (category: string) => {
        setForm((prev) => ({
            ...prev,
            scans: {
                ...prev.scans,
                [category]: { ...prev.scans[category], uploaded: !prev.scans[category].uploaded },
            },
        }));
    };

    const updateLab = (category: string, value: string) => {
        setForm((prev) => ({
            ...prev,
            labTests: { ...prev.labTests, [category]: value },
        }));
    };

    const handleSubmit = () => {
        // Build patient record
        const patient = {
            id: `new-${Date.now()}`,
            name: form.name || 'Unnamed Patient',
            mrn: form.mrn,
            age: form.dob
                ? Math.floor((Date.now() - new Date(form.dob).getTime()) / 31557600000)
                : 0,
            gender: form.gender,
            lastScan: new Date().toISOString().slice(0, 10),
            scanCount: Object.values(form.scans).filter((s) => s.uploaded).length,
            simulationCount: 0,
            status: 'pending' as const,
            medicalHistory: {
                weightHistory: form.weightHistory,
                comorbidities: form.comorbidities,
                surgicalHistory: form.surgicalHistory,
                medications: form.medications,
                psychosocialHistory: form.psychosocialHistory,
            },
            scans: form.scans,
            labTests: form.labTests,
        };

        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('dt-patients') || '[]');
        existing.push(patient);
        localStorage.setItem('dt-patients', JSON.stringify(existing));

        // Navigate to patients list
        router.push('/patients');
    };

    /* ─────────────── Render ─────────────── */
    return (
        <div className="space-y-6">
            {/* Back */}
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            {/* Header */}
            <div className="np-header">
                <h1 className="np-title">
                    Add <span className="np-title-accent">New Patient</span>
                </h1>
                <p className="np-subtitle">
                    Complete the intake form below — provide medical history, upload required scans,
                    and enter lab test results.
                </p>
            </div>

            {/* Step Indicator */}
            <div className="np-steps">
                {steps.map((s) => {
                    const Icon = s.icon;
                    const isActive = step === s.id;
                    const isDone = step > s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setStep(s.id)}
                            className={`np-step ${isActive ? 'np-step--active' : ''} ${isDone ? 'np-step--done' : ''}`}
                        >
                            <span className="np-step-num">
                                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </span>
                            <span className="np-step-label">{s.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="np-section"
                    >
                        <h2 className="np-section-title">
                            <User className="w-5 h-5 inline mr-2 text-blue-400" />
                            Patient Information
                        </h2>

                        <div className="np-form-grid">
                            <div className="np-field">
                                <label className="np-label">Full Name</label>
                                <input
                                    className="np-input"
                                    placeholder="e.g. John Smith"
                                    value={form.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                />
                            </div>
                            <div className="np-field">
                                <label className="np-label">Date of Birth</label>
                                <input
                                    className="np-input"
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) => updateField('dob', e.target.value)}
                                />
                            </div>
                            <div className="np-field">
                                <label className="np-label">Gender</label>
                                <select
                                    className="np-input"
                                    value={form.gender}
                                    onChange={(e) => updateField('gender', e.target.value)}
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="np-field">
                                <label className="np-label">Medical Record #</label>
                                <input className="np-input" value={form.mrn} readOnly />
                            </div>
                        </div>

                        <h2 className="np-section-title" style={{ marginTop: 28 }}>
                            <Heart className="w-5 h-5 inline mr-2 text-red-400" />
                            Medical History
                        </h2>

                        <div className="np-form-stack">
                            {[
                                { key: 'weightHistory' as const, label: 'Weight History', icon: Scale, placeholder: 'Current weight, BMI trends, weight loss attempts...' },
                                { key: 'comorbidities' as const, label: 'Comorbidities', icon: Heart, placeholder: 'Diabetes, hypertension, sleep apnea, GERD...' },
                                { key: 'surgicalHistory' as const, label: 'Surgical History', icon: Scissors, placeholder: 'Previous surgeries, dates, outcomes...' },
                                { key: 'medications' as const, label: 'Current Medications', icon: Pill, placeholder: 'List all current medications and dosages...' },
                                { key: 'psychosocialHistory' as const, label: 'Psychosocial History', icon: Brain, placeholder: 'Mental health, eating behaviors, support system...' },
                            ].map(({ key, label, icon: Icon, placeholder }) => (
                                <div key={key} className="np-field-full">
                                    <label className="np-label">
                                        <Icon className="w-4 h-4 inline mr-1 text-slate-400" />
                                        {label}
                                    </label>
                                    <textarea
                                        className="np-textarea"
                                        placeholder={placeholder}
                                        value={form[key]}
                                        onChange={(e) => updateField(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="np-section"
                    >
                        <h2 className="np-section-title">
                            <FileImage className="w-5 h-5 inline mr-2 text-purple-400" />
                            Required Scans &amp; Imaging
                        </h2>
                        <p className="np-section-subtitle" style={{ marginBottom: 20 }}>
                            Upload or mark each scan as completed. Supported formats: DICOM, NIFTI, PNG, JPG.
                        </p>

                        <div className="np-scan-list">
                            {scanCategories.map((cat) => {
                                const uploaded = form.scans[cat]?.uploaded;
                                return (
                                    <div key={cat} className={`np-scan-item ${uploaded ? 'np-scan-item--done' : ''}`}>
                                        <div className="np-scan-info">
                                            <Stethoscope className="w-5 h-5 text-purple-400" />
                                            <span className="np-scan-name">{cat}</span>
                                        </div>
                                        <div className="np-scan-actions">
                                            <label className="np-upload-btn">
                                                <Upload className="w-3.5 h-3.5" />
                                                Upload
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".dcm,.nii,.nii.gz,.png,.jpg,.jpeg"
                                                    onChange={() => {
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            scans: {
                                                                ...prev.scans,
                                                                [cat]: { ...prev.scans[cat], uploaded: true },
                                                            },
                                                        }));
                                                    }}
                                                />
                                            </label>
                                            <button
                                                onClick={() => markScanUploaded(cat)}
                                                className={`np-check-btn ${uploaded ? 'np-check-btn--active' : ''}`}
                                            >
                                                {uploaded ? <CheckCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="np-section"
                    >
                        <h2 className="np-section-title">
                            <TestTubes className="w-5 h-5 inline mr-2 text-pink-400" />
                            Lab Tests &amp; Reports
                        </h2>
                        <p className="np-section-subtitle" style={{ marginBottom: 20 }}>
                            Enter summary results or notes for each required lab test.
                        </p>

                        <div className="np-form-stack">
                            {labCategories.map((cat) => {
                                const icons: Record<string, typeof Activity> = {
                                    'CBC (Complete Blood Count)': Droplets,
                                    'CMP (Comprehensive Metabolic Panel)': Activity,
                                    'Nutritional Panel': Salad,
                                    'Endocrine Tests': Brain,
                                    'Lipid Profile': Heart,
                                    'Sleep Study Report': Moon,
                                };
                                const Icon = icons[cat] || FileText;
                                return (
                                    <div key={cat} className="np-field-full">
                                        <label className="np-label">
                                            <Icon className="w-4 h-4 inline mr-1 text-slate-400" />
                                            {cat}
                                        </label>
                                        <textarea
                                            className="np-textarea"
                                            placeholder={`Enter ${cat} results or notes...`}
                                            value={form.labTests[cat]}
                                            onChange={(e) => updateLab(cat, e.target.value)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="np-nav">
                {step > 1 ? (
                    <button onClick={prev} className="np-nav-btn np-nav-btn--secondary">
                        <ArrowLeft className="w-4 h-4" /> Previous
                    </button>
                ) : (
                    <div />
                )}
                {step < 3 ? (
                    <button onClick={next} className="np-nav-btn np-nav-btn--primary">
                        Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button onClick={handleSubmit} className="np-nav-btn np-nav-btn--submit">
                        <Check className="w-4 h-4" /> Save Patient
                    </button>
                )}
            </div>
        </div>
    );
}
