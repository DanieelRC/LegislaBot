import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    // Añadimos un timeout para evitar que la solicitud se quede esperando indefinidamente
    const dbConnected = await Promise.race([
      testConnection(),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5000)),
    ])

    const healthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? "connected" : "disconnected",
        openai: process.env.OPENAI_API_KEY ? "configured" : "not configured",
        google: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "configured" : "not configured",
      },
    }

    if (!dbConnected) {
      return NextResponse.json({ ...healthStatus, status: "degraded" }, { status: 207 })
    }

    return NextResponse.json(healthStatus)
  } catch (error) {
    console.error("Health check failed:", error)

    // Devolvemos una respuesta más detallada en desarrollo
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Health check failed: ${(error as Error).message}`
        : "Health check failed"

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
