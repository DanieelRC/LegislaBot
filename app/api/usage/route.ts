import { NextResponse } from "next/server"
import { getApiUsageSummary } from "@/lib/models/api-usage"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parámetros opcionales
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Convertir a objetos Date si están presentes
    const startDate = startDateParam ? new Date(startDateParam) : undefined
    const endDate = endDateParam ? new Date(endDateParam) : undefined

    // En una implementación real, verificaríamos permisos de administrador
    // Por ahora, permitimos acceso sin restricciones

    const usageSummary = await getApiUsageSummary(startDate, endDate)

    return NextResponse.json({ usage: usageSummary })
  } catch (error) {
    console.error("Error fetching API usage:", error)
    return NextResponse.json({ error: "Failed to fetch API usage data" }, { status: 500 })
  }
}
