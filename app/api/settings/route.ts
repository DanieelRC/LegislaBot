import { NextResponse } from 'next/server'
import { getAllSettings, updateSettings } from '@/app/actions/settings'

export async function GET() {
    const settings = await getAllSettings()
    return NextResponse.json(settings)
}

export async function POST(request: Request) {
    const data = await request.json()
    const success = await updateSettings(data)
    return NextResponse.json({ success })
}
