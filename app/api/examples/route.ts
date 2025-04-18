import { NextResponse } from "next/server"
import { listExamples } from "@/lib/models/example"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const activeOnly = searchParams.get("activeOnly") !== "false"

    const examples = await listExamples(limit, offset, category, activeOnly)

    return NextResponse.json({ examples })
  } catch (error) {
    console.error("Error fetching examples:", error)
    return NextResponse.json({ error: "Failed to fetch examples" }, { status: 500 })
  }
}
