'use client';

import { Bell, Search, User, ChevronDown, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPatient, setCurrentPatient] = useState({
        name: 'John Doe',
        id: 'P-2024-001',
        status: 'Active Simulation'
    });

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search patients, scans, or simulations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Current Patient Info */}
            <div className="flex items-center gap-6">
                {/* Patient Badge */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent" />
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">{currentPatient.name}</p>
                        <p className="text-xs text-muted-foreground">{currentPatient.id}</p>
                    </div>
                    <span className="badge-info ml-2">{currentPatient.status}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
                </button>

                {/* User Menu */}
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-white">VK</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>
        </header>
    );
}
