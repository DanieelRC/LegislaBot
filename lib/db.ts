import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// DATABASE_URL_DATABASE_URL la crea la integración de Neon en Vercel (prefijo "DATABASE_URL")
// y se actualiza sola si se regeneran las credenciales; tiene prioridad sobre la variable manual.
const url = (process.env.DATABASE_URL_DATABASE_URL || process.env.DATABASE_URL)?.trim()

/** Cliente SQL de Neon (HTTP, compatible con Edge). `null` si no hay base de datos configurada. */
export const sql: ReturnType<typeof neon> | null = url ? neon(url) : null

/** Cliente Drizzle. `null` si no hay base de datos configurada: la app sigue funcionando sin guardar. */
export const db = sql ? drizzle(sql) : null

export const hasDatabase = Boolean(sql)

export async function testConnection(timeoutMs = 4000): Promise<boolean> {
  if (!sql) return false
  try {
    const rows = (await Promise.race([
      sql`SELECT 1 AS ok`,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeoutMs)),
    ])) as Array<{ ok: number }>
    return rows[0]?.ok === 1
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}
