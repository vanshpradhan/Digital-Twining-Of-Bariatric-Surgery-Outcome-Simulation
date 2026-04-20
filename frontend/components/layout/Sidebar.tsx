'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    Activity,
    BarChart3,
    Shield,
    Upload,
    Boxes,
    Brain,
    Database,
    ChevronLeft,
    ChevronRight,
    Zap,
} from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/patients', icon: Users, label: 'Patients' },
    { href: '/simulation', icon: Activity, label: 'Simulation' },
    { href: '/results', icon: BarChart3, label: 'Results' },
    { href: '/admin', icon: Shield, label: 'Admin' },
];

const toolItems = [
    { href: '/upload', icon: Upload, label: 'Upload Scan' },
    { href: '/models', icon: Boxes, label: '3D Models' },
    { href: '/ai', icon: Brain, label: 'AI Analysis' },
    { href: '/datasets', icon: Database, label: 'Datasets' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 72 : 240 }}
            className="relative flex flex-col h-full bg-card border-r border-border"
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="font-bold text-sm leading-tight">Digital Twin</div>
                        <div className="text-xs text-muted-foreground">Stomach Platform</div>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
                <div className="px-2 py-2">
                    {!isCollapsed && (
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Navigation
                        </span>
                    )}
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'nav-link-active'
                                    : 'nav-link'
                                }`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}

                {/* Tools Section */}
                <div className="px-2 pt-6 pb-2">
                    {!isCollapsed && (
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                            Tools
                        </span>
                    )}
                </div>
                {toolItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'nav-link-active'
                                    : 'nav-link'
                                }`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Status */}
            <div className="p-3 border-t border-border">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {!isCollapsed && (
                        <div>
                            <div className="text-xs font-medium">System Online</div>
                            <div className="text-[10px] text-muted-foreground">All services running</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                ) : (
                    <ChevronLeft className="w-3 h-3" />
                )}
            </button>
        </motion.aside>
    );
}
