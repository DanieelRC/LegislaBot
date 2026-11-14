import { generationSecret } from "./env"

export type GenerationMode = "live" | "demo"

export interface GenerationTokenPayload {
  id: string
  mode: GenerationMode
  exp: number // epoch en segundos
}

const TOKEN_TTL_SECONDS = 60 * 60

const encoder = new TextEncoder()

function toBase64Url(bytes: Uint8Array): string {
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(value: string): Uint8Array {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ])
}

/** Emite un token firmado que autoriza los pasos siguientes de una misma generación. */
export async function signGenerationToken(mode: GenerationMode): Promise<string | null> {
  const secret = generationSecret()
  if (!secret) return null
  const payload: GenerationTokenPayload = {
    id: crypto.randomUUID(),
    mode,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

export async function verifyGenerationToken(token: string): Promise<GenerationTokenPayload | null> {
  const secret = generationSecret()
  if (!secret) return null
  const [body, signature] = token.split(".")
  if (!body || !signature) return null
  try {
    // crypto.subtle.verify compara en tiempo constante
    const valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      fromBase64Url(signature),
      encoder.encode(body),
    )
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as GenerationTokenPayload
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null
    if (payload.mode !== "live" && payload.mode !== "demo") return null
    return payload
  } catch {
    return null
  }
}
