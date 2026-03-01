'use client'

import { useState } from 'react'
import ThreatMap from '@/components/dashboard/ThreatMap'
import HoneypotSessions from '@/components/dashboard/HoneypotSessions'
import AttackTaxonomy from '@/components/dashboard/AttackTaxonomy'
import DOMMutationLog from '@/components/dashboard/DOMMutationLog'
import ThreatFeed from '@/components/ThreatFeed'
import SystemHealth from '@/components/dashboard/SystemHealth'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ThreatContainedTrigger from '@/components/dashboard/ThreatContainedTrigger'
import TrophyRoom from '@/components/dashboard/TrophyRoom'

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TROPHIES'>('OVERVIEW')

    return (
        <div className="w-screen h-screen bg-black overflow-hidden flex flex-col">
            {/* Header */}
            <DashboardHeader />

            {/* Tab Navigation */}
            <div className="flex border-b border-[#222] bg-[#0a0a0a] flex-shrink-0">
                <button
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-6 py-2 text-[10px] tracking-widest font-bold transition-colors ${activeTab === 'OVERVIEW' ? 'text-[#00FF41] border-b-2 border-[#00FF41] bg-[#00FF41]/10' : 'text-[#666] hover:text-white'}`}
                >
                    TACTICAL OVERVIEW
                </button>
                <button
                    onClick={() => setActiveTab('TROPHIES')}
                    className={`px-6 py-2 text-[10px] tracking-widest font-bold transition-colors flex items-center gap-2 ${activeTab === 'TROPHIES' ? 'text-[#FFD700] border-b-2 border-[#FFD700] bg-[#FFD700]/10' : 'text-[#666] hover:text-white'}`}
                >
                    <span className="text-xs">🏆</span> THE TROPHY ROOM
                </button>
            </div>

            {/* Main Content Area */}
            {activeTab === 'OVERVIEW' ? (
                <div className="flex-1 grid grid-cols-12 grid-rows-[1fr_1fr] gap-px overflow-hidden" style={{ minHeight: 0 }}>
                    {/* Row 1 */}
                    <div className="col-span-8 row-span-1 wr-panel overflow-hidden">
                        <ThreatMap />
                    </div>
                    <div className="col-span-4 row-span-1 wr-panel overflow-hidden">
                        <HoneypotSessions />
                    </div>

                    {/* Row 2 */}
                    <div className="col-span-4 row-span-1 wr-panel overflow-hidden">
                        <AttackTaxonomy />
                    </div>
                    <div className="col-span-4 row-span-1 wr-panel overflow-hidden">
                        <DOMMutationLog />
                    </div>
                    <div className="col-span-4 row-span-1 wr-panel flex flex-col overflow-hidden">
                        <ThreatFeed />
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                    <TrophyRoom />
                </div>
            )}

            {/* Bottom Health Bar */}
            <SystemHealth />

            {/* Threat Contained Overlay (trigger wrapper) */}
            <ThreatContainedTrigger />
        </div>
    )
}
