'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Upload,
    FileImage,
    CheckCircle,
    XCircle,
    Loader2,
    ArrowLeft,
    Trash2,
} from 'lucide-react';

interface UploadedFile {
    id: string;
    name: string;
    size: string;
    status: 'uploading' | 'processing' | 'complete' | 'error';
    progress: number;
    modality: string;
}

export default function UploadPage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [patientId, setPatientId] = useState('');
    const [modality, setModality] = useState('CT');

    const simulateUpload = useCallback((newFile: UploadedFile) => {
        const uploadInterval = setInterval(() => {
            setFiles((prev) =>
                prev.map((f) => {
                    if (f.id !== newFile.id) return f;
                    if (f.status === 'complete' || f.status === 'error') return f;
                    const p = f.progress + Math.random() * 15;
                    if (p >= 100) {
                        clearInterval(uploadInterval);
                        // Start processing
                        setTimeout(() => {
                            setFiles((prev2) =>
                                prev2.map((f2) =>
                                    f2.id === newFile.id ? { ...f2, status: 'processing' as const } : f2
                                )
                            );
                            setTimeout(() => {
                                setFiles((prev2) =>
                                    prev2.map((f2) =>
                                        f2.id === newFile.id ? { ...f2, status: 'complete' as const, progress: 100 } : f2
                                    )
                                );
                            }, 2000);
                        }, 500);
                        return { ...f, progress: 100, status: 'uploading' as const };
                    }
                    return { ...f, progress: p };
                })
            );
        }, 300);
    }, []);

    const handleFiles = useCallback(
        (fileList: FileList) => {
            Array.from(fileList).forEach((file) => {
                const newFile: UploadedFile = {
                    id: Math.random().toString(36).slice(2),
                    name: file.name,
                    size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    status: 'uploading',
                    progress: 0,
                    modality: modality,
                };
                setFiles((prev) => [...prev, newFile]);
                simulateUpload(newFile);
            });
        },
        [modality, simulateUpload]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback(() => setDragActive(false), []);

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
                return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />;
            case 'complete':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />;
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Back */}
            <Link href="/" className="page-back">
                <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>

            <h1 className="page-title">Upload DICOM Scans</h1>
            <p className="page-subtitle">
                Upload CT or MRI scans for segmentation and 3D model generation.
            </p>

            {/* Configuration */}
            <div className="page-glass">
                <h3 className="font-semibold mb-4 text-white">Upload Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="np-label">Patient ID</label>
                        <input
                            type="text"
                            placeholder="e.g. P-2024-001"
                            className="np-input mt-1"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="np-label">Modality</label>
                        <select
                            className="np-input mt-1"
                            value={modality}
                            onChange={(e) => setModality(e.target.value)}
                        >
                            <option value="CT">CT Scan</option>
                            <option value="MRI">MRI</option>
                            <option value="Ultrasound">Ultrasound</option>
                            <option value="X-ray">X-ray</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="page-glass cursor-pointer transition-colors text-center"
                style={{
                    paddingTop: 48,
                    paddingBottom: 48,
                    borderColor: dragActive ? 'rgba(59,130,246,0.5)' : undefined,
                    background: dragActive ? 'rgba(59,130,246,0.08)' : undefined,
                }}
                onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = '.dcm,.nii,.nii.gz,.dicom';
                    input.onchange = (e) => {
                        const fl = (e.target as HTMLInputElement).files;
                        if (fl) handleFiles(fl);
                    };
                    input.click();
                }}
            >
                <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-white font-medium text-lg">
                    Drag &amp; drop DICOM files here
                </p>
                <p className="text-[#64748b] text-sm mt-2">or click to browse &bull; .dcm, .nii, .nii.gz</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="page-glass !p-0">
                    <div className="px-6 py-4 text-sm font-medium text-[#94a3b8]" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {files.length} file(s)
                    </div>
                    <div>
                        {files.map((file, index) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-4 px-6 py-4"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                            >
                                <FileImage className="w-8 h-8 text-[#64748b] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">{file.name}</div>
                                    <div className="text-sm text-[#64748b]">
                                        {file.size} &bull; {file.modality}
                                    </div>
                                    {file.status === 'uploading' && (
                                        <div className="progress-bar mt-2">
                                            <div className="progress-fill" style={{ width: `${file.progress}%` }} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(file.status)}
                                    <span className="text-sm text-[#94a3b8] capitalize w-20">{file.status}</span>
                                    <button onClick={() => removeFile(file.id)} className="text-[#64748b] hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
