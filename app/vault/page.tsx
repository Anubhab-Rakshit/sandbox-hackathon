'use client'

import { useState } from 'react'
import { useWallet } from '@/components/WalletProvider'
import Topbar from '@/components/Topbar'
import DynamicTitle from '@/components/DynamicTitle'
import SvgDefs from '@/components/SvgDefs'
import AmbientLayer from '@/components/AmbientLayer'
import HexGridCanvas from '@/components/HexGridCanvas'
import CustomCursor from '@/components/CustomCursor'

export default function VaultPage() {
    const { isActive, address, balance, connectWallet } = useWallet()
    const [stakeAmount, setStakeAmount] = useState('0.0')
    const [isStaking, setIsStaking] = useState(false)
    const [trapped, setTrapped] = useState(false)
    const [notification, setNotification] = useState<string | null>(null)

    const showNotification = (msg: string) => {
        setNotification(msg)
        setTimeout(() => setNotification(null), 4000)
    }

    // Simulate a fake total value locked that slowly ticks up
    const tvlBase = 143502.50
    const [tvl, setTvl] = useState(tvlBase)

    const handleStake = async () => {
        if (!isActive) {
            connectWallet()
            return
        }

        setIsStaking(true)
        // Simulate block confirmation delay
        await new Promise(r => setTimeout(r, 2000))
        setIsStaking(false)
        showNotification('Staking Contract Paused. Please try again later.')
    }

    const fireTrap = async (vector: string) => {
        setTrapped(true)
        try {
            await fetch('/api/trap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exploit_vector: vector,
                    address: address || 'unconnected',
                    balance: balance || '0',
                    timestamp: new Date().toISOString()
                })
            })
            // Deliberately opaque generic error message to confuse the attacker
            showNotification('JSON-RPC Error: execution reverted')
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#05050A] font-mono text-[var(--text-dim)]">
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

                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar flex items-center justify-center">

                    {/* In-page notification toast */}
                    {notification && (
                        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0b0c10] border border-[#FF003C] text-[#FF003C] text-xs tracking-widest px-6 py-3 font-mono shadow-[0_0_20px_rgba(255,0,60,0.3)] animate-pulse">
                            ⚠ {notification}
                        </div>
                    )}

                    {/* The Honey-Vault UI */}
                    <div className="max-w-2xl w-full">

                        <div className="text-center mb-12">
                            <h1 className="text-5xl font-bold tracking-[0.3em] text-white">LIQUIDITY VAULT</h1>
                            <p className="text-[#00FFD1] mt-4 uppercase tracking-[0.2em] animate-pulse">
                                OVER {tvl.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETH LOCKED IN SMART CONTRACTS
                            </p>
                        </div>

                        <div className="bg-[#0b0c10]/80 backdrop-blur-xl border border-[#222] p-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,255,209,0.05)]">
                            {/* Decorative corner accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00FFD1] opacity-50" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00FFD1] opacity-50" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00FFD1] opacity-50" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00FFD1] opacity-50" />

                            <div className="flex justify-between items-center mb-8 border-b border-[#222] pb-6">
                                <div>
                                    <h3 className="text-xl text-white font-bold tracking-widest uppercase">Stake ETH</h3>
                                    <p className="text-xs text-[#666] mt-1 space-x-4">
                                        <span>APY: <span className="text-[#00FF41]">18.4%</span></span>
                                        <span>LOCKUP: 7 DAYS</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-[#666] tracking-widest mb-1 uppercase">Your Wallet Balance</p>
                                    <p className="text-lg text-[#00FFD1]">{balance || '0.000'} ETH</p>
                                </div>
                            </div>

                            <div className="mb-8 relative">
                                <label className="block text-xs uppercase tracking-widest text-[#888] mb-2">Amount to Stake</label>
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        value={stakeAmount}
                                        onChange={(e) => setStakeAmount(e.target.value)}
                                        className="w-full bg-black border border-[#333] px-4 py-4 text-white text-xl font-mono focus:outline-none focus:border-[#00FFD1] transition-colors"
                                        placeholder="0.0"
                                    />
                                    <button
                                        className="absolute right-4 text-xs tracking-widest uppercase text-[var(--accent-magenta)] hover:text-white transition-colors border border-[var(--accent-magenta)] px-3 py-1 rounded-sm"
                                        onClick={() => setStakeAmount(balance || '0.0')}
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleStake}
                                disabled={isStaking}
                                className={`w-full py-5 font-bold tracking-[0.2em] text-sm transition-all duration-300 ${isActive
                                        ? 'bg-[rgba(0,255,209,0.1)] border border-[#00FFD1] text-[#00FFD1] hover:bg-[#00FFD1] hover:text-black shadow-[0_0_20px_rgba(0,255,209,0.2)]'
                                        : 'bg-[rgba(255,255,255,0.05)] border border-[#444] text-[#888] hover:bg-white hover:text-black'
                                    }`}
                            >
                                {isStaking
                                    ? '[ AWAITING SIGNATURE... ]'
                                    : isActive ? 'DEPOSIT AND STAKE' : 'CONNECT WALLET TO STAKE'}
                            </button>

                        </div>

                        {/* ========================================================= 
                            HONEYPOT TRAP: Intentional vulnerability disguised as an 
                            accidental developer console leak 
                           ========================================================= */}
                        <div className="mt-12 opacity-0 hover:opacity-100 transition-opacity flex justify-center group focus-within:opacity-100">
                            {/* We write "Admin Config (debug)" in tiny gray text deep below the fold to trick automated DOM scrapers and curious hackers looking for flaws */}
                            <div className="text-center max-w-sm w-full">
                                <p className="text-[9px] text-[#444] tracking-widest uppercase mb-2">// Dev Debug Panel</p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={() => fireTrap('emergency_withdraw_arbitrage')}
                                        className="text-[10px] bg-[#111] border border-[#222] text-[#555] px-3 py-1 hover:border-[#FF003C] hover:text-[#FF003C] transition-colors"
                                    >
                                        triggerEmergencyWithdraw()
                                    </button>
                                    <button
                                        onClick={() => fireTrap('override_contract_owner')}
                                        className="text-[10px] bg-[#111] border border-[#222] text-[#555] px-3 py-1 hover:border-[#FF003C] hover:text-[#FF003C] transition-colors"
                                    >
                                        setOwner(msg.sender)
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    )
}
