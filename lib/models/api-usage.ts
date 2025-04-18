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

// Función para obtener el resumen de uso de API con costos y filtros de fecha
export async function getApiUsageSummary(
  startDate?: Date | string,
  endDate?: Date | string
): Promise<ApiUsageSummary[]> {
  try {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    let query = db
      .select({
        api_name: apiUsageTable.api_name,
        total_tokens: sql`COALESCE(SUM(${apiUsageTable.tokens_used}), 0)`.as(
          "total_tokens"
        ),
      })
      .from(apiUsageTable)

    if (start) {
      query = query.where(apiUsageTable.created_at.gte(start))
    }
    if (end) {
      query = query.where(apiUsageTable.created_at.lte(end))
    }

    query = query.groupBy(apiUsageTable.api_name)
    const results = await query

    return results.map(({ api_name, total_tokens }) => {
      const tokens = Number(total_tokens ?? 0)
      return {
        api_name,
        total_tokens: tokens,
        total_cost: tokens * getCostPerToken(api_name),
      }
    })
  } catch (error) {
    console.error("Error al obtener resumen de uso de API:", error)
    return []
  }
}

// Función para ejecutar consultas SQL personalizadas
export async function executeQuery<T = any>(
  queryString: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const rawQ = sql.raw(queryString, ...params)
    const { rows } = await db.execute(rawQ)
    return rows as T[]
  } catch (error) {
    console.error(`Error al ejecutar consulta: ${queryString}`, error)
    throw new Error(
      `Error en la base de datos: ${
        error instanceof Error ? error.message : "desconocido"
      }`
    )
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