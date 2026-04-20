'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="landing-hero-v2">
            <div className="landing-hero-v2__bg" />
            <div className="landing-hero-v2__vignette" />
            <div className="landing-hero-v2__scanline" />

            <motion.section
                className="landing-hero-v2__content"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
                <p className="landing-hero-v2__eyebrow">Digital Twin Platform</p>

                <h1 className="landing-hero-v2__title" aria-label="Bariatric Simulator">
                    <span className="landing-hero-v2__line1">Bariatric</span>
                    <span className="landing-hero-v2__line2">Simulator</span>
                </h1>

                <p className="landing-hero-v2__desc">
                    Simulating bariatric outcomes with sub-millimeter precision.
                    Where AI meets surgical reality.
                </p>

                <Link href="/patients" className="landing-hero-v2__cta">
                    Enter Platform <ArrowRight className="h-4 w-4" />
                </Link>
            </motion.section>
        </main>
    );
}
