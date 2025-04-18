import { NextResponse } from "next/server"
import { listDrafts } from "@/lib/models/draft"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // En una implementación real, obtendríamos el ID del usuario de la sesión
    const userId = null // Por ahora es null hasta implementar autenticación

    const drafts = await listDrafts(limit, offset)

    return NextResponse.json({
      drafts: drafts.map((draft) => ({
        id: draft.id.toString(),
        title: draft.title,
        content: draft.content,
        createdAt: draft.created_at.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
  }
}
