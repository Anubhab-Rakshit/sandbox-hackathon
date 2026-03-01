'use client'

import { useEffect, useRef, useState } from 'react'
import LogoHex from './LogoHex'
import ShieldStatus from './ShieldStatus'
import { useWallet } from './WalletProvider'

export default function Topbar() {
    const { isActive, address, balance } = useWallet()

    return (
        <header className="topbar-glass w-full h-full flex items-center justify-between px-7 relative z-10">
            {/* Left: Logo */}
            <LogoHex />

            {/* Center: decorative line */}
            <div className="flex-1 mx-8 h-px opacity-20"
                style={{ background: 'linear-gradient(90deg, transparent, #3D00B8, #00FFD1, #3D00B8, transparent)' }}
            />

            {/* Right: Wallet & Shield */}
            <div className="flex items-center gap-6">
                <a href="/vault" className="text-[9px] text-[#00FF41] hover:text-white tracking-[0.2em] font-bold transition-all border border-[#00FF41] bg-[#00FF41]/10 shadow-[0_0_10px_rgba(0,255,65,0.2)] px-4 py-2 uppercase">
                    Launch Vault
                </a>
                <a href="/ledger" className="text-[9px] text-[var(--accent-magenta)] hover:text-white tracking-[0.2em] uppercase font-mono transition-colors border border-[rgba(255,0,255,0.2)] bg-[rgba(255,0,255,0.05)] px-3 py-1.5 rounded-sm">
                    IMMUTABLE LEDGER
                </a>
                {isActive && address && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,255,209,0.3)] bg-[rgba(0,255,209,0.05)] shadow-[0_0_15px_rgba(0,255,209,0.1)] transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FFD1] shadow-[0_0_5px_#00FFD1] animate-pulse" />
                        <span className="text-[10px] text-[#00FFD1] font-mono tracking-widest">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                        <div className="w-px h-3 bg-[rgba(0,255,209,0.3)] mx-1" />
                        <span className="text-[10px] text-[var(--text-dim)] font-mono">
                            {balance} ETH
                        </span>
                    </div>
                )}
                <ShieldStatus />
            </div>
        </header>
    )
}
