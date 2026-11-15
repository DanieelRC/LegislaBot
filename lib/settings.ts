import { inArray, sql as dsql } from "drizzle-orm"
import { db } from "./db"
import { settingsTable } from "./schema"
import { SETTING_KEYS, type PublicSettings } from "./validation"

/** Lee solo las claves de la lista blanca. Nunca devuelve secretos. */
export async function getPublicSettings(): Promise<PublicSettings> {
  if (!db) return {}
  try {
    const rows = await db
      .select({ key: settingsTable.key, value: settingsTable.value })
      .from(settingsTable)
      .where(inArray(settingsTable.key, [...SETTING_KEYS]))
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as PublicSettings
  } catch (error) {
    console.error("Error al leer ajustes:", error)
    return {}
  }
}

export async function savePublicSettings(settings: PublicSettings): Promise<boolean> {
  if (!db) return false
  try {
    for (const [key, value] of Object.entries(settings)) {
      if (value === undefined) continue
      await db
        .insert(settingsTable)
        .values({ key, value })
        .onConflictDoUpdate({ target: settingsTable.key, set: { value, updated_at: dsql`now()` } })
    }
    return true
  } catch (error) {
    console.error("Error al guardar ajustes:", error)
    return false
  }
}
