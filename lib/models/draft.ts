import { executeQuery } from "../db"

export interface Draft {
  id: number
  title: string
  content: string
  bill_id: number | null
  created_at: Date
}

export interface CreateDraftInput {
  title: string
  content: string
  bill_id?: number | null
}

export async function createDraft(data: CreateDraftInput): Promise<Draft> {
  const { title, content, bill_id = null } = data

  const result = await executeQuery<Draft[]>(
    `INSERT INTO drafts (title, content, bill_id) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [title, content, bill_id],
  )

  return result[0]
}

export async function getDraftById(id: number): Promise<Draft | null> {
  const result = await executeQuery<Draft[]>("SELECT * FROM drafts WHERE id = $1", [id])

  return result[0] || null
}

export async function deleteDraft(id: number): Promise<boolean> {
  const result = await executeQuery("DELETE FROM drafts WHERE id = $1 RETURNING id", [id])

  return !!result[0]
}

export async function listDrafts(limit = 10, offset = 0): Promise<Draft[]> {
  const query = "SELECT * FROM drafts ORDER BY created_at DESC LIMIT $1 OFFSET $2"
  const values = [limit, offset]

  return executeQuery<Draft[]>(query, values)
}

export async function convertDraftToBill(
  draftId: number,
  status: "draft" | "published" = "draft",
): Promise<number | null> {
  // Obtener el borrador
  const draft = await getDraftById(draftId)
  if (!draft) return null

  // Iniciar una transacción
  const result = await executeQuery<{ id: number }[]>(
    `WITH inserted_bill AS (
      INSERT INTO bills (title, content, topic, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    )
    SELECT id FROM inserted_bill`,
    [draft.title, draft.content, "AI Generated", status],
  )

  if (!result[0]) return null

  return result[0].id
}
