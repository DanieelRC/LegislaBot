import { NextResponse } from "next/server"

export async function GET() {
  // Lista de variables de entorno requeridas
  const requiredEnvVars = ["OPENAI_API_KEY", "GOOGLE_API_KEY"]

  // Verificar cuáles faltan
  const missingVars = requiredEnvVars.filter((varName) => {
    const value = process.env[varName]
    return !value || value === `your_${varName.toLowerCase()}_here`
  })

  if (missingVars.length > 0) {
    return NextResponse.json({
      success: false,
      missingVars,
    })
  }

  return NextResponse.json({
    success: true,
  })
}
