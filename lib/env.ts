/** Hay claves para ambos proveedores de IA. Sin ellas la app responde en modo demo. */
export function hasAiKeys(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim() && process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim())
}

export function dailyGenerationLimit(): number {
  const n = Number.parseInt(process.env.DAILY_GENERATION_LIMIT ?? "", 10)
  return Number.isFinite(n) && n >= 0 ? n : 3
}

/**
 * Secreto para firmar tokens de generación. En producción es obligatorio:
 * si falta, no se habilita el modo real (solo demo).
 */
export function generationSecret(): string | null {
  const secret = process.env.GENERATION_SECRET?.trim()
  if (secret) return secret
  return process.env.NODE_ENV === "production" ? null : "dev-only-secret-no-usar-en-produccion"
}
