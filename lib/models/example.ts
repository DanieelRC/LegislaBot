import { executeQuery } from "../db"

export interface Example {
  id: number
  title: string
  description: string | null
  content: string
  category: string | null
  is_active: boolean
  created_at: Date
}

export interface CreateExampleInput {
  title: string
  description?: string | null
  content: string
  category?: string | null
  is_active?: boolean
}

export async function createExample(data: CreateExampleInput): Promise<Example> {
  const { title, description = null, content, category = null, is_active = true } = data

  const result = await executeQuery<Example[]>(
    `INSERT INTO examples (title, description, content, category, is_active) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [title, description, content, category, is_active],
  )

  return result[0]
}

export async function getExampleById(id: number): Promise<Example | null> {
  const result = await executeQuery<Example[]>("SELECT * FROM examples WHERE id = $1", [id])

  return result[0] || null
}

export async function listExamples(limit = 10, offset = 0, category?: string, activeOnly = true): Promise<Example[]> {
  let query = "SELECT * FROM examples"
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (activeOnly) {
    conditions.push(`is_active = true`)
  }

  if (category) {
    conditions.push(`category = $${paramIndex}`)
    values.push(category)
    paramIndex++
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
  values.push(limit, offset)

  return executeQuery<Example[]>(query, values)
}
