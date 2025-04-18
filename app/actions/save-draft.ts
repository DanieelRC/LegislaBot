"use server"

import { db } from "@/lib/db"
import { desc } from "drizzle-orm"
import { draftsTable } from "@/lib/schema"
import {
  createDraft,
  deleteDraft as deleteDraftFromModel,
  getDraftById,
} from "@/lib/models/draft"
import { revalidatePath } from "next/cache"

// Interfaz para borrador con fecha formateada
export interface DraftWithFormattedDate {
  id: string
  title: string
  content: string
  created_at: string
}

// Interfaz para respuesta de un único borrador
export interface DraftResponse {
  id: string
  title: string
  content: string
  createdAt: string
}

export async function saveDraft(
  title: string,
  content: string
): Promise<{ success: boolean; id: string }> {
  try {
    const draft = await createDraft({ title, content })
    revalidatePath("/")
    return { success: true, id: String(draft.id) }
  } catch (error) {
    console.error("Error saving draft:", error)
    throw new Error("Failed to save draft")
  }
}

export async function getDrafts(): Promise<DraftWithFormattedDate[]> {
  try {
    const drafts = await db
      .select()
      .from(draftsTable)
      .orderBy(desc(draftsTable.created_at))

    return drafts.map((d) => {
      // Asegurar objeto Date
      const dateObj =
        d.created_at instanceof Date ? d.created_at : new Date(d.created_at)
      return {
        id: String(d.id),
        title: d.title,
        content: d.content,
        created_at: dateObj.toISOString(),
      }
    })
  } catch (error) {
    console.error("Error getting drafts:", error)
    throw new Error("Failed to get drafts")
  }
}

export async function getDraftByIdAction(
  id: string
): Promise<DraftResponse | null> {
  try {
    const d = await getDraftById(Number(id))
    if (!d) return null

    const dateObj =
      d.created_at instanceof Date ? d.created_at : new Date(d.created_at)

    return {
      id: String(d.id),
      title: d.title,
      content: d.content,
      createdAt: dateObj.toISOString(),
    }
  } catch (error) {
    console.error("Error getting draft by ID:", error)
    throw new Error("Failed to get draft")
  }
}

export async function deleteDraftAction(
  id: string
): Promise<{ success: boolean }> {
  try {
    const ok = await deleteDraftFromModel(Number(id))
    if (ok) revalidatePath("/")
    return { success: ok }
  } catch (error) {
    console.error("Error deleting draft:", error)
    throw new Error("Failed to delete draft")
  }
}

export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const { success } = await deleteDraftAction(id)
    return success
  } catch {
    return false
  }
}