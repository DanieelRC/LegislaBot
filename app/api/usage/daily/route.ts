import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/models/api-usage"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parámetros opcionales
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")
    const days = Number.parseInt(searchParams.get("days") || "30", 10)

    // Convertir a objetos Date si están presentes
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(new Date().setDate(new Date().getDate() - days))
    const endDate = endDateParam ? new Date(endDateParam) : new Date()

    // Consulta para obtener datos agrupados por día
    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(tokens_used) as tokens,
        SUM(cost_estimate) as cost
      FROM api_usage
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    const dailyUsage = await executeQuery(query, [startDate, endDate])

    // Formatear las fechas para mejor visualización
    const formattedData = dailyUsage.map((day: any) => ({
      date: day.date.toISOString().split("T")[0],
      tokens: day.tokens,
      cost: Number.parseFloat(day.cost),
    }))

    return NextResponse.json({ dailyUsage: formattedData })
  } catch (error) {
    console.error("Error fetching daily API usage:", error)
    return NextResponse.json({ error: "Failed to fetch daily API usage data" }, { status: 500 })
  }
}
