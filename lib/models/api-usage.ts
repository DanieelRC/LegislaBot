import { db } from "@/lib/db"
import { sql } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

// Definición del esquema de la tabla api_usage
export const apiUsageTable = pgTable("api_usage", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  api_name: text("api_name").notNull(),
  tokens_used: integer("tokens_used").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// Interfaz para el registro de uso
export interface ApiUsage {
  api_name: string
  tokens_used: number
}

// Interfaz para el resumen de uso de API
export interface ApiUsageSummary {
  api_name: string
  total_tokens: number
  total_cost: number
}

// Función para registrar el uso de la API
export async function recordApiUsage(usage: ApiUsage): Promise<void> {
  try {
    await db.insert(apiUsageTable).values({
      api_name: usage.api_name,
      tokens_used: usage.tokens_used,
    })
  } catch (error) {
    console.error("Error al registrar el uso de la API:", error)
    throw new Error("Error al registrar el uso de la API")
  }
}

// Función para obtener estadísticas de uso (sin costos)
export async function getApiUsageStats(): Promise<{
  total_tokens: number
  usage_by_api: Record<string, number>
}> {
  try {
    const totalResult = await db
      .select({ total: sql`sum(tokens_used)`.as("total") })
      .from(apiUsageTable)
    const byApiResult = await db
      .select({
        api_name: apiUsageTable.api_name,
        tokens: sql`sum(tokens_used)`.as("tokens"),
      })
      .from(apiUsageTable)
      .groupBy(apiUsageTable.api_name)

    const usageByApi: Record<string, number> = {}
    byApiResult.forEach((row) => {
      usageByApi[row.api_name] = Number(row.tokens)
    })

    return {
      total_tokens: Number(totalResult[0]?.total || 0),
      usage_by_api: usageByApi,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas de uso:", error)
    return { total_tokens: 0, usage_by_api: {} }
  }
}

// Función auxiliar para determinar costo por token según el API
function getCostPerToken(apiName: string): number {
  switch (apiName.toLowerCase()) {
    case "gpt-4":
    case "gpt-4o":
      return 0.00003
    case "gpt-3.5-turbo":
      return 0.000005
    case "gemini-1.5-pro":
      return 0.000007
    case "claude-3-sonnet":
      return 0.000015
    default:
      return 0.00001
  }
}