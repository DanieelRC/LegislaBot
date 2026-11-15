import { sql } from "./db"

export interface RateLimitResult {
  allowed: boolean
  count: number
}

// Respaldo en memoria (mejor esfuerzo) cuando no hay base de datos o falla la consulta.
const memory = new Map<string, { count: number; expiresAt: number }>()

function consumeInMemory(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || entry.expiresAt < now) {
    memory.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 })
    return { allowed: limit >= 1, count: 1 }
  }
  entry.count += 1
  return { allowed: entry.count <= limit, count: entry.count }
}

/**
 * Cuenta un uso de `key` dentro de una ventana fija y dice si sigue dentro del límite.
 * Operación atómica en Postgres (upsert), válida en entornos serverless.
 */
export async function consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  if (!sql) return consumeInMemory(key, limit, windowSeconds)
  try {
    const rows = (await sql`
      INSERT INTO rate_limits (key, count, expires_at)
      VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.expires_at < now() THEN 1 ELSE rate_limits.count + 1 END,
        expires_at = CASE WHEN rate_limits.expires_at < now() THEN EXCLUDED.expires_at ELSE rate_limits.expires_at END
      RETURNING count
    `) as Array<{ count: number }>
    const count = Number(rows[0]?.count ?? 1)
    return { allowed: count <= limit, count }
  } catch (error) {
    console.error("Rate limit: fallo en BD, usando memoria:", error)
    return consumeInMemory(key, limit, windowSeconds)
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("")
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}
