'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Users,
    ArrowRight,
    Upload,
    Brain,
    Database,
    Settings,
    Boxes,
    ChevronDown,
    ChevronUp,
    Wrench,
} from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const imageVariants = {
    hidden: { opacity: 0, scale: 0.85, x: 60 },
    visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
};

const toolLinks = [
    { href: '/upload', icon: Upload, label: 'Upload Scan' },
    { href: '/models', icon: Boxes, label: '3D Models' },
    { href: '/ai', icon: Brain, label: 'AI Analysis' },
    { href: '/datasets', icon: Database, label: 'Datasets' },
    { href: '/admin', icon: Settings, label: 'Admin' },
];

/* ── Inline SVG vector stomach — matching reference neon glow style ── */
function StomachVector() {
    return (
        <svg
            viewBox="0 0 520 680"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hero-stomach-svg"
        >
            <defs>
                {/* Heavy outer glow */}
                <filter id="heavyGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b2" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b3" />
                    <feMerge>
                        <feMergeNode in="b1" />
                        <feMergeNode in="b2" />
                        <feMergeNode in="b3" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Medium glow for outline */}
                <filter id="medGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2" />
                    <feMerge>
                        <feMergeNode in="b1" />
                        <feMergeNode in="b2" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Soft vein glow */}
                <filter id="veinGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                {/* Diffuse aura */}
                <filter id="auraGlow" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="35" />
                </filter>
                {/* Particle glow */}
                <filter id="dotGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>

                {/* Gradients */}
                <linearGradient id="bodyFill" x1="120" y1="80" x2="380" y2="580" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00ccff" stopOpacity="0.12" />
                    <stop offset="30%" stopColor="#0088dd" stopOpacity="0.18" />
                    <stop offset="60%" stopColor="#006aaa" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#003366" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="outlineGrad" x1="300" y1="10" x2="180" y2="600" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#44eeff" />
                    <stop offset="35%" stopColor="#00bbff" />
                    <stop offset="70%" stopColor="#0077dd" />
                    <stop offset="100%" stopColor="#0055bb" />
                </linearGradient>
                <linearGradient id="innerGrad" x1="350" y1="100" x2="200" y2="500" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#33ddff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0055aa" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="vGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00eedd" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0077cc" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="vGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#33ccff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#004488" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="vGrad3" x1="50%" y1="0%" x2="50%" y2="100%">
                    <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#0066bb" stopOpacity="0.1" />
                </linearGradient>
                <radialGradient id="dotFill" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#66eeff" stopOpacity="1" />
                    <stop offset="60%" stopColor="#00bbff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0088dd" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* ===== ESOPHAGUS (top-right, angled tube coming down) ===== */}
            {/* Aura */}
            <path
                d="M 370 5 C 360 30, 345 70, 330 105 C 315 140, 305 165, 300 185"
                stroke="#0099ff" strokeWidth="38" strokeLinecap="round" fill="none"
                filter="url(#auraGlow)" opacity="0.18" className="hero-svg-aura"
            />
            {/* Esophagus tube outline */}
            <path
                d="M 370 5 C 360 30, 345 70, 330 105 C 315 140, 305 165, 300 185"
                stroke="url(#outlineGrad)" strokeWidth="4" strokeLinecap="round" fill="none"
                filter="url(#heavyGlow)" className="hero-svg-outline"
            />
            {/* Esophagus inner edge (right wall) */}
            <path
                d="M 385 8 C 375 35, 362 72, 348 108 C 334 144, 326 168, 320 190"
                stroke="#00aadd" strokeWidth="1.5" strokeLinecap="round" fill="none"
                filter="url(#veinGlow)" opacity="0.3"
            />

            {/* ===== MAIN STOMACH BODY (J-shape, large bag) ===== */}
            {/* Huge diffuse aura behind the body */}
            <path
                d="M 300 185 C 280 190, 240 195, 195 210
                   C 145 228, 105 260, 85 305
                   C 65 355, 68 415, 90 465
                   C 112 510, 148 545, 190 565
                   C 230 583, 270 585, 305 572
                   C 345 555, 378 520, 395 480
                   C 408 448, 410 415, 405 395
                   C 398 365, 380 345, 355 338
                   C 335 332, 310 332, 290 340"
                stroke="#0088cc" strokeWidth="50" strokeLinecap="round" fill="none"
                filter="url(#auraGlow)" opacity="0.12" className="hero-svg-aura"
            />

            {/* Body fill — translucent blue interior */}
            <path
                d="M 300 185 C 280 190, 240 195, 195 210
                   C 145 228, 105 260, 85 305
                   C 65 355, 68 415, 90 465
                   C 112 510, 148 545, 190 565
                   C 230 583, 270 585, 305 572
                   C 345 555, 378 520, 395 480
                   C 408 448, 410 415, 405 395
                   C 398 365, 380 345, 355 338
                   C 335 332, 310 332, 290 340
                   L 290 340 C 300 320, 310 290, 315 260
                   C 318 240, 312 215, 300 185 Z"
                fill="url(#bodyFill)" opacity="0.85"
            />

            {/* Main outline — thick neon glow */}
            <path
                d="M 300 185 C 280 190, 240 195, 195 210
                   C 145 228, 105 260, 85 305
                   C 65 355, 68 415, 90 465
                   C 112 510, 148 545, 190 565
                   C 230 583, 270 585, 305 572
                   C 345 555, 378 520, 395 480
                   C 408 448, 410 415, 405 395
                   C 398 365, 380 345, 355 338
                   C 335 332, 310 332, 290 340"
                stroke="url(#outlineGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none"
                filter="url(#heavyGlow)" className="hero-svg-outline"
            />

            {/* Lesser curvature (inner curve of J) */}
            <path
                d="M 320 190 C 325 220, 328 260, 320 300
                   C 312 340, 310 365, 320 390
                   C 330 410, 350 425, 375 430
                   C 388 432, 398 425, 405 410"
                stroke="url(#innerGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none"
                filter="url(#medGlow)" opacity="0.45"
            />

            {/* ===== DUODENUM (exit tube, bottom-left) ===== */}
            {/* Aura */}
            <path
                d="M 290 340 C 265 355, 240 370, 215 390
                   C 190 410, 170 435, 155 460
                   C 140 485, 125 520, 108 555
                   C 95 580, 80 610, 65 640"
                stroke="#0088cc" strokeWidth="32" strokeLinecap="round" fill="none"
                filter="url(#auraGlow)" opacity="0.12" className="hero-svg-aura"
            />
            {/* Duodenum outline */}
            <path
                d="M 290 340 C 265 355, 240 370, 215 390
                   C 190 410, 170 435, 155 460
                   C 140 485, 125 520, 108 555
                   C 95 580, 80 610, 65 640"
                stroke="url(#outlineGrad)" strokeWidth="3.5" strokeLinecap="round" fill="none"
                filter="url(#heavyGlow)" className="hero-svg-outline"
            />

            {/* ===== INTERNAL VEINS / BLOOD VESSELS ===== */}
            <g filter="url(#veinGlow)">
                {/* Major veins — thick, prominent */}
                <path d="M 180 260 C 175 300, 155 350, 140 400 C 130 435, 140 475, 170 510"
                    stroke="url(#vGrad1)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
                <path d="M 230 235 C 220 280, 200 335, 190 385 C 182 425, 195 470, 220 510 C 240 540, 265 555, 285 558"
                    stroke="url(#vGrad2)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
                <path d="M 270 220 C 275 270, 275 330, 265 385 C 258 425, 270 470, 300 510"
                    stroke="url(#vGrad3)" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.55" />
                <path d="M 310 230 C 320 280, 330 340, 325 395 C 320 430, 340 460, 370 470"
                    stroke="url(#vGrad1)" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5" />

                {/* Secondary veins — medium */}
                <path d="M 145 290 C 160 330, 150 370, 140 410"
                    stroke="url(#vGrad2)" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.45" />
                <path d="M 200 250 C 195 295, 185 340, 185 390 C 185 430, 200 465, 230 495"
                    stroke="url(#vGrad1)" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.45" />
                <path d="M 250 240 C 248 285, 240 335, 240 385 C 240 430, 255 465, 280 490"
                    stroke="url(#vGrad3)" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.4" />
                <path d="M 350 360 C 360 390, 372 420, 380 450"
                    stroke="url(#vGrad2)" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />

                {/* Branching capillaries */}
                <path d="M 170 320 C 190 318, 205 310, 215 295" stroke="#00ccbb" strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round" />
                <path d="M 155 380 C 175 372, 195 378, 208 390" stroke="#00aadd" strokeWidth="0.9" fill="none" opacity="0.4" strokeLinecap="round" />
                <path d="M 210 310 C 230 305, 245 312, 255 325" stroke="#00bbcc" strokeWidth="0.8" fill="none" opacity="0.35" strokeLinecap="round" />
                <path d="M 195 440 C 218 432, 235 440, 250 455" stroke="#00ccbb" strokeWidth="0.8" fill="none" opacity="0.35" strokeLinecap="round" />
                <path d="M 245 370 C 265 362, 280 370, 290 385" stroke="#00aadd" strokeWidth="0.8" fill="none" opacity="0.35" strokeLinecap="round" />
                <path d="M 280 300 C 298 295, 310 305, 318 320" stroke="#00bbcc" strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
                <path d="M 130 350 C 148 345, 160 355, 168 370" stroke="#00cccc" strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
                <path d="M 265 450 C 280 442, 295 448, 305 460" stroke="#00bbdd" strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
                <path d="M 300 400 C 318 392, 332 400, 340 415" stroke="#00aacc" strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
                <path d="M 165 460 C 185 455, 200 462, 212 478" stroke="#00ccaa" strokeWidth="0.7" fill="none" opacity="0.3" strokeLinecap="round" />
                <path d="M 220 480 C 240 472, 258 480, 268 498" stroke="#00bbcc" strokeWidth="0.7" fill="none" opacity="0.28" strokeLinecap="round" />
            </g>

            {/* ===== RUGAE FOLDS (subtle interior texture lines) ===== */}
            <g opacity="0.2">
                <path d="M 140 300 C 200 290, 260 295, 310 310" stroke="#0099bb" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                <path d="M 120 360 C 180 348, 250 355, 330 370" stroke="#0088aa" strokeWidth="0.7" fill="none" strokeLinecap="round" />
                <path d="M 110 420 C 170 408, 245 415, 350 430" stroke="#0099bb" strokeWidth="0.7" fill="none" strokeLinecap="round" />
                <path d="M 120 475 C 180 462, 255 468, 360 478" stroke="#0088aa" strokeWidth="0.6" fill="none" strokeLinecap="round" />
                <path d="M 145 530 C 200 518, 270 522, 340 535" stroke="#0099bb" strokeWidth="0.6" fill="none" strokeLinecap="round" />
            </g>

            {/* ===== FLOATING PARTICLES / SPARKLES ===== */}
            <g className="hero-svg-particles">
                {/* Around esophagus */}
                <circle cx="395" cy="28" r="3" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--1" />
                <circle cx="340" cy="75" r="2.2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--3" />
                <circle cx="380" cy="110" r="2.5" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--5" />

                {/* Left side of body */}
                <circle cx="55" cy="280" r="3" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--2" />
                <circle cx="42" cy="370" r="2.5" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--4" />
                <circle cx="60" cy="450" r="2.8" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--6" />
                <circle cx="75" cy="530" r="2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--8" />

                {/* Bottom */}
                <circle cx="140" cy="590" r="3.2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--1" />
                <circle cx="230" cy="600" r="2.5" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--7" />
                <circle cx="310" cy="580" r="2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--3" />

                {/* Right side */}
                <circle cx="420" cy="350" r="2.8" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--5" />
                <circle cx="430" cy="470" r="3" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--2" />
                <circle cx="415" cy="250" r="2.2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--6" />

                {/* Scattered around */}
                <circle cx="110" cy="220" r="2.5" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--4" />
                <circle cx="350" cy="545" r="2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--8" />
                <circle cx="30" cy="510" r="2.5" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--1" />
                <circle cx="460" cy="160" r="2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--7" />
                <circle cx="175" cy="610" r="2.8" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--3" />
                <circle cx="45" cy="620" r="2.2" fill="url(#dotFill)" filter="url(#dotGlow)" className="hero-particle hero-particle--5" />
            </g>

            {/* Esophagus opening ring */}
            <ellipse cx="370" cy="5" rx="16" ry="6" stroke="#44eeff" strokeWidth="1.5" fill="none" opacity="0.35" filter="url(#medGlow)" />
        </svg>
    );
}

export default function HomePage() {
    const [toolsOpen, setToolsOpen] = useState(false);

    return (
        <div className="hero-root">
            {/* ── Background ambient effects ── */}
            <div className="hero-bg-ambient" />
            <div className="hero-bg-scanline" />
            <div className="hero-bg-orb" />

            {/* ── Layout: Left text + Right vector art ── */}
            <div className="hero-split">
                {/* ─── Left: Content ─── */}
                <motion.div
                    className="hero-left"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Title */}
                    <motion.h1 variants={itemVariants} className="hero-title">
                        BariatSim
                    </motion.h1>

                    <motion.p variants={itemVariants} className="hero-tagline">
                        Digital twin based surgical simulation
                    </motion.p>

                    {/* Description */}
                    <motion.p variants={itemVariants} className="hero-desc">
                        A patient-specific digital twin platform that creates a virtual model of the
                        stomach from medical scans to simulate bariatric surgery. Predict
                        stapling performance, tissue stress, and leak risk for safer, more
                        personalized procedures.
                    </motion.p>

                    {/* Action Cards */}
                    <motion.div variants={itemVariants} className="hero-actions">
                        <Link href="/new-patient" className="hero-action-card group">
                            <div className="hero-action-icon hero-action-icon--blue">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div className="hero-action-body">
                                <h2 className="hero-action-title">Add New Patient</h2>
                                <p className="hero-action-desc">
                                    Upload scans &amp; medical history to begin the digital twin pipeline
                                </p>
                                <span className="hero-action-cta">
                                    Get Started <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>

                        <Link href="/patients" className="hero-action-card group">
                            <div className="hero-action-icon hero-action-icon--purple">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="hero-action-body">
                                <h2 className="hero-action-title">Existing Patient</h2>
                                <p className="hero-action-desc">
                                    View records, select a patient and proceed with simulation
                                </p>
                                <span className="hero-action-cta">
                                    Browse Records <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Tools Dropdown */}
                    <motion.div variants={itemVariants} className="hero-tools">
                        <button
                            onClick={() => setToolsOpen(!toolsOpen)}
                            className="tools-dropdown-btn"
                        >
                            <Wrench className="w-4 h-4" />
                            Tools
                            {toolsOpen ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>

                        <AnimatePresence>
                            {toolsOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="tools-dropdown-panel"
                                >
                                    {toolLinks.map(({ href, icon: Icon, label }) => (
                                        <Link key={href} href={href} className="landing-tool-item group">
                                            <Icon className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                                            <span>{label}</span>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* ─── Right: Vector Stomach Art ─── */}
                <motion.div
                    className="hero-right"
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <StomachVector />
                </motion.div>
            </div>
        </div>
    );
}
