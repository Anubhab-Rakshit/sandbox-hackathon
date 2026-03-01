'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
    address: string | null
    balance: string | null
    chainId: number | null
    missingMetaMask: boolean
    isActive: boolean
    connectWallet: () => Promise<void>
    dismissModal: () => void
}

const WalletContext = createContext<WalletContextType>({
    address: null,
    balance: null,
    chainId: null,
    missingMetaMask: false,
    isActive: false,
    connectWallet: async () => { },
    dismissModal: () => { },
})

export function useWallet() {
    return useContext(WalletContext)
}

// Sepolia chain ID is 11155111 (0xaa36a7)
const TARGET_CHAIN_ID = BigInt(11155111)
const TARGET_CHAIN_HEX = '0xaa36a7'

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null)
    const [balance, setBalance] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [missingMetaMask, setMissingMetaMask] = useState(false)
    const [isActive, setIsActive] = useState(false)

    const dismissModal = () => setMissingMetaMask(false)

    const connectWallet = async () => {
        // 1. Check for MetaMask
        if (typeof window === 'undefined' || !(window as any).ethereum) {
            setMissingMetaMask(true)
            return
        }

        try {
            const eth = (window as any).ethereum

            // 2. Request Accounts
            const accounts = await eth.request({ method: 'eth_requestAccounts' })
            if (!accounts || accounts.length === 0) return

            const currentAddress = accounts[0]
            const provider = new ethers.BrowserProvider(eth)

            // 3. Enforce Sepolia Network
            let network = await provider.getNetwork()
            if (network.chainId !== TARGET_CHAIN_ID) {
                try {
                    await eth.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: TARGET_CHAIN_HEX }],
                    })
                    // Refresh network after switch
                    network = await provider.getNetwork()
                } catch (switchError: any) {
                    console.error("User rejected network switch or Sepolia not added.", switchError)
                    return // Abort if they refuse to switch
                }
            }

            // 4. Fetch Balance
            const balanceWei = await provider.getBalance(currentAddress)
            const balanceEth = parseFloat(ethers.formatEther(balanceWei)).toFixed(4)

            // 5. Update State
            setAddress(currentAddress)
            setBalance(balanceEth)
            setChainId(Number(network.chainId))
            setIsActive(true)

            // 6. Notify the Backend telemetry that a legitimate node was protected
            fetch('/api/protect', { method: 'POST' }).catch(() => { })

        } catch (err) {
            console.error("Error connecting wallet:", err)
        }
    }

    // Handle account/chain changes
    useEffect(() => {
        if (typeof window === 'undefined' || !(window as any).ethereum) return
        const eth = (window as any).ethereum

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                setIsActive(false)
                setAddress(null)
                setBalance(null)
            } else {
                // Just reconnect to fetch new balances
                connectWallet()
            }
        }

        const handleChainChanged = () => {
            window.location.reload()
        }

        eth.on('accountsChanged', handleAccountsChanged)
        eth.on('chainChanged', handleChainChanged)

        return () => {
            eth.removeListener('accountsChanged', handleAccountsChanged)
            eth.removeListener('chainChanged', handleChainChanged)
        }
    }, [])

    return (
        <WalletContext.Provider value={{ address, balance, chainId, missingMetaMask, isActive, connectWallet, dismissModal }}>
            {children}

            {/* Missing MetaMask Modal */}
            {missingMetaMask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0b0c10] border border-[rgba(255,0,60,0.5)] p-8 max-w-md w-full relative shadow-[0_0_30px_rgba(255,0,60,0.2)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF003C] to-transparent" />

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full border border-[#FF003C] flex items-center justify-center text-[#FF003C] text-2xl">
                                !
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-widest">MetaMask Required</h3>
                                <p className="text-xs text-[#FF003C] font-mono tracking-widest mt-1">ERR_NO_PROVIDER_DETECTED</p>
                            </div>
                        </div>

                        <p className="text-sm text-[var(--text-dim)] mb-8 leading-relaxed">
                            To securely connect your wallet to the Bhool Bhulaiyaa network and bypass automated threat detection, you must have the legitimate MetaMask browser extension installed.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={dismissModal}
                                className="px-4 py-2 text-xs text-[var(--text-dim)] hover:text-white transition-colors uppercase tracking-widest"
                            >
                                Dismiss
                            </button>
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-2 bg-[rgba(255,0,60,0.1)] border border-[#FF003C] text-[#FF003C] hover:bg-[#FF003C] hover:text-white transition-all uppercase tracking-widest text-xs font-bold"
                            >
                                Install MetaMask
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </WalletContext.Provider>
    )
}
