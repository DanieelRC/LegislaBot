import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"
import { hasAiKeys } from "@/lib/env"

export const dynamic = "force-dynamic"

// Solo expone lo que la interfaz necesita: si se puede guardar y si la IA es real o demo.
export async function GET() {
  const database = await testConnection()
  return NextResponse.json({ status: database ? "ok" : "degraded", database, ai: hasAiKeys() ? "live" : "demo" })
}
