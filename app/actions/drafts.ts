"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { draftsTable } from "@/lib/schema"
import { consume } from "@/lib/rate-limit"
import { ensureOwnerId, readOwnerId } from "@/lib/session"
import { draftIdSchema, draftInputSchema } from "@/lib/validation"

export interface DraftSummary {
  id: string
  title: string
  excerpt: string
  createdAt: string
}

export interface DraftDetail {
  id: string
  title: string
  content: string
  createdAt: string
}

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }

const NO_DB = "El guardado no está disponible: no hay base de datos configurada."

// Todas las operaciones se limitan a los borradores de la sesión anónima actual (cookie httpOnly).

export async function saveDraft(title: string, content: string): Promise<Result<{ id: string }>> {
  const parsed = draftInputSchema.safeParse({ title, content })
  if (!parsed.success) return { ok: false, error: "El borrador no es válido." }
  if (!db) return { ok: false, error: NO_DB }
  const ownerId = ensureOwnerId()
  const { allowed } = await consume(`save:${ownerId}`, 30, 3600)
  if (!allowed) return { ok: false, error: "Has guardado demasiados borradores. Intenta más tarde." }
  try {
    const [row] = await db
      .insert(draftsTable)
      .values({ ...parsed.data, owner_id: ownerId })
      .returning({ id: draftsTable.id })
    revalidatePath("/bills")
    return { ok: true, id: String(row.id) }
  } catch (error) {
    console.error("Error saving draft:", error)
    return { ok: false, error: "No se pudo guardar el borrador." }
  }
}

export async function listDrafts(): Promise<Result<{ drafts: DraftSummary[] }>> {
  if (!db) return { ok: false, error: NO_DB }
  const ownerId = readOwnerId()
  if (!ownerId) return { ok: true, drafts: [] }
  try {
    const rows = await db
      .select()
      .from(draftsTable)
      .where(eq(draftsTable.owner_id, ownerId))
      .orderBy(desc(draftsTable.created_at))
      .limit(100)
    return {
      ok: true,
      drafts: rows.map((d) => ({
        id: String(d.id),
        title: d.title,
        excerpt: d.content.slice(0, 400),
        createdAt: new Date(d.created_at).toISOString(),
      })),
    }
  } catch (error) {
    console.error("Error listing drafts:", error)
    return { ok: false, error: "No se pudieron cargar los borradores." }
  }
}

export async function getDraft(id: string): Promise<DraftDetail | null> {
  const parsedId = draftIdSchema.safeParse(id)
  const ownerId = readOwnerId()
  if (!db || !ownerId || !parsedId.success) return null
  try {
    const [d] = await db
      .select()
      .from(draftsTable)
      .where(and(eq(draftsTable.id, parsedId.data), eq(draftsTable.owner_id, ownerId)))
      .limit(1)
    if (!d) return null
    return { id: String(d.id), title: d.title, content: d.content, createdAt: new Date(d.created_at).toISOString() }
  } catch (error) {
    console.error("Error getting draft:", error)
    return null
  }
}

export async function deleteDraft(id: string): Promise<Result> {
  const parsedId = draftIdSchema.safeParse(id)
  const ownerId = readOwnerId()
  if (!db) return { ok: false, error: NO_DB }
  if (!ownerId || !parsedId.success) return { ok: false, error: "Borrador no encontrado." }
  try {
    const deleted = await db
      .delete(draftsTable)
      .where(and(eq(draftsTable.id, parsedId.data), eq(draftsTable.owner_id, ownerId)))
      .returning({ id: draftsTable.id })
    if (deleted.length === 0) return { ok: false, error: "Borrador no encontrado." }
    revalidatePath("/bills")
    return { ok: true }
  } catch (error) {
    console.error("Error deleting draft:", error)
    return { ok: false, error: "No se pudo eliminar el borrador." }
  }
}
