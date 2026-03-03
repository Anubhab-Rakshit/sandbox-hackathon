'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import Topbar from '@/components/Topbar'
import DynamicTitle from '@/components/DynamicTitle'
import SvgDefs from '@/components/SvgDefs'
import AmbientLayer from '@/components/AmbientLayer'
import HexGridCanvas from '@/components/HexGridCanvas'
import CustomCursor from '@/components/CustomCursor'

interface LedgerEntry {
    threat_id: string
    timestamp: string
    ip: string
    tier: string
    toolchain: string
    tx_hash: string
}

export default function LedgerPage() {
    const { isActive, address, connectWallet } = useWallet()
    const [entries, setEntries] = useState<LedgerEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState<string | null>(null)
    const [verifiedIds, setVerifiedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchLedger = async () => {
            try {
                const res = await fetch('/api/ledger')
                if (res.ok) {
                    const data = await res.json()
                    setEntries(data.ledger || [])
                }
            } catch (err) {
                console.error("Failed to fetch ledger:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchLedger()
        const interval = setInterval(fetchLedger, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleVerify = async (entry: LedgerEntry) => {
        if (!isActive) {
            connectWallet()
            return
        }

        setVerifying(entry.threat_id)

        // Simulate a cryptographic contract call delay
        await new Promise(r => setTimeout(r, 1500))

        setVerifiedIds(prev => new Set(prev).add(entry.threat_id))
        setVerifying(null)
    }

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#0A0A0F] font-mono text-[var(--text-dim)]">
            <DynamicTitle />
            <SvgDefs />

            <div className="scanline-overlay" />
            <div className="scan-beam" />
            <AmbientLayer />
            <HexGridCanvas />
            <CustomCursor />

            <div className="relative z-10 w-full h-full flex flex-col">
                <div className="h-[64px] flex-shrink-0">
                    <Topbar />
                </div>

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8">

                        <div className="flex items-end justify-between border-b border-[#222] pb-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-[0.2em] text-white">IMMUTABLE THREAT LEDGER</h1>
                                <p className="text-xs text-[var(--accent-magenta)] mt-2 uppercase tracking-widest">Global Decentralized Intelligence Network</p>
                            </div>

                            {!isActive ? (
                                <button
                                    onClick={connectWallet}
                                    className="px-6 py-2 border border-[#00FFD1] bg-[#00FFD1]/10 text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black transition-all font-bold tracking-widest text-xs"
                                >
                                    CONNECT WALLET TO VERIFY
                                </button>
                            ) : (
                                <div className="px-6 py-2 border border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41] font-bold tracking-widest text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
                                    WEB3 IDENTITY SECURED
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center p-20 text-[#00FFD1] animate-pulse tracking-widest text-sm">
                                [ SYNCHRONIZING WITH BLOCKCHAIN... ]
                            </div>
                        ) : (
                            <div className="bg-[#0b0c10]/80 backdrop-blur-md border border-[#222]">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-[#333] bg-black">
                                        <tr>
                                            <th className="px-6 py-4 tracking-widest uppercase text-[#888] font-normal">Timestamp (UTC)</th>
                                            <th className="px-6 py-4 tracking-widest uppercase text-[#888] font-normal">Threat ID</th>
                                            <th className="px-6 py-4 tracking-widest uppercase text-[#888] font-normal">Origins</th>
                                            <th className="px-6 py-4 tracking-widest uppercase text-[#888] font-normal">Toolchain</th>
                                            <th className="px-6 py-4 tracking-widest uppercase text-[#888] font-normal">Integrity Hash</th>
                                            <th className="px-6 py-4 tracking-widest uppercase text-[#888] font-normal">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#111]">
                                        {entries.map((entry) => {
                                            const isVerified = verifiedIds.has(entry.threat_id)
                                            const isVerifying = verifying === entry.threat_id

                                            return (
                                                <tr key={entry.threat_id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#aaa]">{entry.timestamp.split('.')[0].replace('T', ' ')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-[#00FF41]">{entry.threat_id}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-[#ccc]">{entry.ip}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 py-1 bg-[#222] text-[#e0e0e0] border border-[#444] rounded-[2px]">
                                                            {entry.toolchain}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[#aaa] font-mono tracking-tight text-[10px]">
                                                        {entry.tx_hash.substring(0, 16)}...{entry.tx_hash.substring(entry.tx_hash.length - 12)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {isVerified ? (
                                                            <div className="flex items-center gap-2 text-[#00FFD1]">
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                                                VERIFIED
                                                            </div>
                                                        ) : isVerifying ? (
                                                            <div className="flex items-center gap-2 text-[#FFD700] animate-pulse">
                                                                [ SIGNING TX... ]
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleVerify(entry)}
                                                                className="text-[#aaa] hover:text-[#00FFD1] transition-colors tracking-widest uppercase text-[10px]"
                                                            >
                                                                VERIFY HASH
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {entries.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-[#666] tracking-widest">
                                                    NO THREAT LOGS FOUND IN BLOCK HEIGHT
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
