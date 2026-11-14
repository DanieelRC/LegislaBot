import { createHash, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"
import { getPublicSettings, savePublicSettings } from "@/lib/settings"
import { settingsSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"

function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN?.trim()
  const provided = request.headers.get("x-admin-token") ?? ""
  if (!expected || !provided) return false
  // Se comparan hashes de longitud fija para no filtrar longitud ni contenido por tiempo
  const a = createHash("sha256").update(expected).digest()
  const b = createHash("sha256").update(provided).digest()
  return timingSafeEqual(a, b)
}

export async function GET() {
  return NextResponse.json({
    settings: await getPublicSettings(),
    editable: Boolean(process.env.ADMIN_TOKEN?.trim()),
  })
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }
  const success = await savePublicSettings(parsed.data)
  return NextResponse.json({ success }, { status: success ? 200 : 503 })
}
