import { executeQuery } from "../db"

export interface Bill {
  id: number
  title: string
  content: string
  topic: string
  status: "draft" | "published" | "archived"
  created_at: Date
  updated_at: Date
}

export interface CreateBillInput {
  title: string
  content: string
  topic: string
  status?: "draft" | "published" | "archived"
}

export interface UpdateBillInput {
  title?: string
  content?: string
  topic?: string
  status?: "draft" | "published" | "archived"
}

export async function createBill(data: CreateBillInput): Promise<Bill> {
  const { title, content, topic, status = "draft" } = data

  const result = await executeQuery<Bill[]>(
    `INSERT INTO bills (title, content, topic, status) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [title, content, topic, status],
  )

  return result[0]
}

export async function getBillById(id: number): Promise<Bill | null> {
  const result = await executeQuery<Bill[]>("SELECT * FROM bills WHERE id = $1", [id])

  return result[0] || null
}

export async function updateBill(id: number, data: UpdateBillInput): Promise<Bill | null> {
  // Construir dinámicamente la consulta de actualización
  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = $${paramIndex}`)
      values.push(value)
      paramIndex++
    }
  })

  // Añadir updated_at
  updates.push(`updated_at = CURRENT_TIMESTAMP`)

  // Si no hay nada que actualizar, retornar null
  if (updates.length === 1) {
    return null
  }

  values.push(id)

  const result = await executeQuery<Bill[]>(
    `UPDATE bills SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values,
  )

  return result[0] || null
}

export async function deleteBill(id: number): Promise<boolean> {
  const result = await executeQuery("DELETE FROM bills WHERE id = $1 RETURNING id", [id])

  return !!result[0]
}

export async function listBills(limit = 10, offset = 0, status?: "draft" | "published" | "archived"): Promise<Bill[]> {
  let query = "SELECT * FROM bills"
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (status) {
    conditions.push(`status = $${paramIndex}`)
    values.push(status)
    paramIndex++
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`
  }

  query += ` ORDER BY updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
  values.push(limit, offset)

  return executeQuery<Bill[]>(query, values)
}
