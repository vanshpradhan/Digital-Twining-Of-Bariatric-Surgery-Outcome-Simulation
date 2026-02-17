'use client';

import { usePathname } from 'next/navigation';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLanding = pathname === '/';

    if (isLanding) {
        return <>{children}</>;
    }

    return (
        <div style={{ position: 'relative', width: '100vw', minHeight: '100vh', background: '#050510' }}>
            {/* Scrollable content */}
            <div className="relative z-10 min-h-screen scrollbar-thin">
                <div className="page-container">
                    {children}
                </div>
            </div>
        </div>
    );
}
