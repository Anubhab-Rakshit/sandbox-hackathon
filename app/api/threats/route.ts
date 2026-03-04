import { NextResponse, NextRequest } from 'next/server'
import { getBotStats } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FASTAPI_URL = 'http://127.0.0.1:8000'

// Server-side token cache — so the public homepage can still fetch real threat data
// without requiring the user to be logged in.
let cachedServerToken: string | null = null
let tokenExpiry = 0

async function getServerToken(): Promise<string | null> {
    if (cachedServerToken && Date.now() < tokenExpiry) return cachedServerToken
    try {
        const res = await fetch(`${FASTAPI_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: process.env.ADMIN_USER ?? 'bhool',
                password: process.env.ADMIN_PASS ?? 'bhulaiyaa2026',
            }),
            signal: AbortSignal.timeout(2000),
        })
        if (!res.ok) return null
        const data = await res.json()
        cachedServerToken = data.token ?? null
        // Refresh 30 min before the 8-hour expiry
        tokenExpiry = Date.now() + (7.5 * 60 * 60 * 1000)
        return cachedServerToken
    } catch {
        return null
    }
}

export async function GET(request: NextRequest) {
    try {
        const stats: any = getBotStats()

        // Prefer the user's own token; fall back to auto server token
        const userHeader = request.headers.get('authorization')
        const serverToken = userHeader ? null : await getServerToken()
        const authHeader = userHeader ?? (serverToken ? `Bearer ${serverToken}` : null)
        const fetchHeaders: Record<string, string> = authHeader
            ? { 'Authorization': authHeader }
            : {}

        let logs = []
        try {
            const apiRes = await fetch(`${FASTAPI_URL}/api/dashboard`, {
                headers: fetchHeaders,
                signal: AbortSignal.timeout(1500)
            })
            if (apiRes.ok) {
                const data = await apiRes.json()
                logs = data.logs || []
                if (data.stats) {
                    stats.taxonomy = data.stats.taxonomy || []
                    stats.mutations_total = data.stats.mutations_total || 0
                    stats.bots = data.stats.bots || stats.bots
                }
            }
        } catch (backendErr) {
            console.error("FastAPI Backend unreachable:", backendErr)
        }

        return NextResponse.json({ logs, stats })
    } catch (err) {
        return NextResponse.json({ logs: [], stats: { total: 0, bots: 0, suspicious: 0 } })
    }
}
