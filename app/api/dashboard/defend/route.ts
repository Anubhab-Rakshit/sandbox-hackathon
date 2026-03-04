import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = 'http://127.0.0.1:8000'

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization') || ''
        const body = await req.json()

        const apiRes = await fetch(`${FASTAPI_URL}/api/dashboard/defend`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(3000),
        })

        const data = await apiRes.json()
        return NextResponse.json(data, { status: apiRes.status })
    } catch (err) {
        console.error('Failed to proxy /api/dashboard/defend:', err)
        return NextResponse.json({ error: 'Defense deployment failed' }, { status: 503 })
    }
}
