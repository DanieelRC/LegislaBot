import { cookies } from "next/headers"

const COOKIE = "lb_sid"
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** Id de la sesión anónima actual, si existe (solo lectura; válido en Server Components). */
export function readOwnerId(): string | null {
  const value = cookies().get(COOKIE)?.value
  return value && UUID.test(value) ? value : null
}

/**
 * Id de la sesión anónima; la crea si no existe. Solo en Server Actions o Route Handlers
 * (donde se pueden escribir cookies). Los borradores quedan ligados a este id.
 */
export function ensureOwnerId(): string {
  const existing = readOwnerId()
  if (existing) return existing
  const id = crypto.randomUUID()
  cookies().set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  return id
}
