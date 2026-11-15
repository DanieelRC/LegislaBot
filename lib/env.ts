/** Hay clave de xAI (Grok). Sin ella la app responde en modo demo. */
export function hasAiKeys(): boolean {
  return Boolean(process.env.XAI_API_KEY?.trim())
}

export function dailyGenerationLimit(): number {
  const n = Number.parseInt(process.env.DAILY_GENERATION_LIMIT ?? "", 10)
  return Number.isFinite(n) && n >= 0 ? n : 3
}

/**
 * Secreto para firmar tokens de generación. Usa GENERATION_SECRET si existe; si no, deriva
 * uno de XAI_API_KEY (también secreta y solo del servidor), con un prefijo que separa su uso.
 * Sin clave de IA no hay nada que proteger: la ruta fuerza el modo demo y basta un valor fijo.
 */
export function generationSecret(): string {
  const explicit = process.env.GENERATION_SECRET?.trim()
  if (explicit) return explicit
  const apiKey = process.env.XAI_API_KEY?.trim()
  if (apiKey) return `legislabot:generation-token:${apiKey}`
  return "legislabot:demo-only"
}
