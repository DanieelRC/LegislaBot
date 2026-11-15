import { db } from "./db"
import { apiUsageTable } from "./schema"

/** Registra el consumo de tokens de una llamada a IA. Nunca interrumpe la generación. */
export async function logApiUsage(apiName: string, tokensUsed: number, requestType: string): Promise<void> {
  if (!db || !Number.isFinite(tokensUsed)) return
  try {
    await db.insert(apiUsageTable).values({ api_name: apiName, tokens_used: tokensUsed, request_type: requestType })
  } catch (error) {
    console.error("Error al registrar uso de API:", error)
  }
}
