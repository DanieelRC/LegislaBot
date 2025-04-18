import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Configuración para entornos serverless
neonConfig.fetchConnectionCache = true

// Tipo para representar un cliente SQL compatible con neon
type SqlClient = ReturnType<typeof neon>

// Crear cliente SQL con la URL de conexión de Neon
function createSqlClient(): SqlClient {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL no está definida, usando modo de demostración")
      
      // Cliente simulado que soporta tanto llamadas normales como template literals
      const mockSql: any = (textOrTemplate: string | TemplateStringsArray, ...values: any[]) => {
        if (typeof textOrTemplate === 'string') {
          // Modo: sql(query, params)
          console.log("SQL simulado (query):", textOrTemplate, values[0] || [])
        } else {
          // Modo: sql`query ${param}`
          console.log("SQL simulado (template):", textOrTemplate, values)
        }
        return Promise.resolve([])
      }
      
      return mockSql as SqlClient
    }
    
    return neon(process.env.DATABASE_URL)
  } catch (error) {
    console.error("Error al crear cliente SQL:", error)
    throw new Error("No se pudo conectar a la base de datos")
  }
}

const sql = createSqlClient()

// Crear cliente Drizzle para operaciones tipadas
export const db = drizzle(sql)

// Función de utilidad para ejecutar consultas SQL directas con mejor manejo de errores
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  try {
    return (await sql(query, params)) as T
  } catch (error) {
    console.error("Error executing query:", error, { query, params })

    // Si estamos en modo de desarrollo, mostramos más detalles
    if (process.env.NODE_ENV === "development") {
      throw new Error(`Database query failed: ${(error as Error).message}`)
    } else {
      throw new Error("Database query failed")
    }
  }
}

// Función para verificar la conexión a la base de datos con timeout
export async function testConnection(timeout = 5000): Promise<boolean> {
  try {
    const result = await Promise.race([
      sql`SELECT 1 as test`,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Database connection timeout")), timeout)
      ),
    ]) as Array<{test: number}>

    // Validación más segura del resultado
    return Array.isArray(result) && result.length > 0 && result[0]?.test === 1
  } catch (error) {
    console.error("Database connection test failed:", error)
    return false
  }
}