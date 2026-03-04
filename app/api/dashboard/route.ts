import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const FASTAPI_URL = 'http://127.0.0.1:8000'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization') || ''

        const apiRes = await fetch(`${FASTAPI_URL}/api/dashboard`, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(3000),
        })

        if (!apiRes.ok) {
            return NextResponse.json({ logs: [] }, { status: apiRes.status })
        }

        const data = await apiRes.json()
        return NextResponse.json(data)
    } catch (err) {
        console.error('Failed to proxy /api/dashboard:', err)
        return NextResponse.json({ logs: [] }, { status: 503 })
    }
}
