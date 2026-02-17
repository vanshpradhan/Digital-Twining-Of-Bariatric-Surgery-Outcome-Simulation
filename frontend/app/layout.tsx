import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/layout/LayoutShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'BariatSim | Bariatric Surgery Planning',
    description: 'Patient-specific digital twin platform for bariatric surgery planning and drug response simulation.',
    keywords: ['digital twin', 'stomach', 'bariatric surgery', 'medical simulation', 'FEM'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-background text-foreground`}>
                <LayoutShell>{children}</LayoutShell>
            </body>
        </html>
    );
}
