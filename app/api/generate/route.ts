import { xai } from "@ai-sdk/xai"
import { streamText } from "ai"
import { DEMO_CLOSING, DEMO_EXPOSITION, DEMO_OUTLINE, DEMO_RESEARCH, DEMO_TITLES } from "@/lib/demo-content"
import { dailyGenerationLimit, hasAiKeys } from "@/lib/env"
import { signGenerationToken, verifyGenerationToken, type GenerationMode } from "@/lib/generation-token"
import {
  closingPrompt,
  expositionPrompt,
  MODEL,
  outlinePrompt,
  researchPrompt,
  titlePrompt,
  type PromptSpec,
} from "@/lib/prompts"
import { clientIp, consume, sha256Hex } from "@/lib/rate-limit"
import { getPublicSettings } from "@/lib/settings"
import { logApiUsage } from "@/lib/usage"
import { generateRequestSchema, type GenerateRequest } from "@/lib/validation"

// Edge: la respuesta empieza a transmitirse de inmediato y puede seguir en streaming
// más allá del límite de las funciones serverless. Cada paso es además una petición corta.
export const runtime = "edge"

const MAX_STEPS_PER_GENERATION = 40
/** Marcador que indica al cliente que la sección se interrumpió por un error del modelo. */
const STREAM_ERROR_MARKER = "\u0000[error]"
const DEFAULT_LEGISLATOR = "[Nombre de la persona legisladora proponente]"

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

function todayInSpanish(): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" }).format(new Date())
}

async function legislator(): Promise<string> {
  const settings = await getPublicSettings()
  return settings.default_legislator?.trim() || DEFAULT_LEGISLATOR
}

/** Transmite un texto fijo por fragmentos, igual que lo haría el modelo. */
function demoResponse(text: string, headers: HeadersInit): Response {
  const encoder = new TextEncoder()
  const chunks = text.match(/\S+\s*/g) ?? [text]
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (let i = 0; i < chunks.length; i += 3) {
        controller.enqueue(encoder.encode(chunks.slice(i, i + 3).join("")))
        await new Promise((resolve) => setTimeout(resolve, 25))
      }
      controller.close()
    },
  })
  return new Response(stream, { headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" } })
}

async function demoText(body: GenerateRequest): Promise<string> {
  switch (body.step) {
    case "research":
      return DEMO_RESEARCH
    case "outline":
      return DEMO_OUTLINE
    case "exposition":
      return DEMO_EXPOSITION
    case "title":
      return DEMO_TITLES[body.index] ?? DEMO_TITLES[DEMO_TITLES.length - 1]
    case "closing":
      return DEMO_CLOSING(todayInSpanish(), await legislator())
  }
}

async function buildPrompt(body: GenerateRequest): Promise<PromptSpec> {
  switch (body.step) {
    case "research":
      return researchPrompt(body.topic)
    case "outline":
      return outlinePrompt(body.topic, body.research)
    case "exposition":
      return expositionPrompt(body.topic, body.research, body.lawTitle)
    case "title":
      return titlePrompt(body.topic, body.research, body.lawTitle, body.outline, body.index)
    case "closing":
      return closingPrompt(body.topic, body.research, body.lawTitle, body.outline, await legislator())
  }
}

export async function POST(request: Request) {
  const parsed = generateRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Solicitud inválida" }, 400)
  }
  const body = parsed.data

  let mode: GenerationMode
  let token: string
  let demoReason = ""

  if (body.step === "research") {
    // Primer paso: aquí se consume la cuota diaria por IP y se emite el token de la generación.
    if (!hasAiKeys()) {
      mode = "demo"
      demoReason = "no-keys"
    } else {
      const ipHash = await sha256Hex(`ip:${clientIp(request)}`)
      const { allowed } = await consume(`gen:${ipHash}`, dailyGenerationLimit(), 60 * 60 * 24)
      mode = allowed ? "live" : "demo"
      if (!allowed) demoReason = "limit"
    }
    token = await signGenerationToken(mode)
  } else {
    const payload = await verifyGenerationToken(body.token)
    if (!payload) {
      return json({ error: "La sesión de generación expiró. Inicia una nueva." }, 401)
    }
    const { allowed } = await consume(`tok:${payload.id}`, MAX_STEPS_PER_GENERATION, 60 * 60)
    if (!allowed) {
      return json({ error: "Se alcanzó el máximo de pasos para esta generación." }, 429)
    }
    // Sin clave de IA siempre es demo, aunque el token diga otra cosa
    mode = hasAiKeys() ? payload.mode : "demo"
    token = body.token
  }

  const headers: Record<string, string> = {
    "X-Generation-Token": token,
    "X-Generation-Mode": mode,
    "Cache-Control": "no-store",
  }
  if (demoReason) headers["X-Demo-Reason"] = demoReason

  if (mode === "demo") {
    return demoResponse(await demoText(body), headers)
  }

  try {
    const spec = await buildPrompt(body)
    const result = streamText({
      model: xai(MODEL.id),
      system: spec.system,
      prompt: spec.prompt,
      maxTokens: spec.maxTokens,
      abortSignal: request.signal,
      onError: ({ error }) => console.error(`Error de IA en el paso "${body.step}":`, error),
      onFinish: async ({ usage }) => {
        const settings = await getPublicSettings()
        if (settings.enable_api_usage_tracking !== "false") {
          await logApiUsage(`${MODEL.provider}/${MODEL.id}`, usage.totalTokens, body.step)
        }
      },
    })
    // Se responde de inmediato: el modelo razona antes de escribir y las cabeceras no deben
    // esperar a ese razonamiento. El texto se reenvía conforme llega; si falla a mitad,
    // se agrega un marcador de error que el cliente convierte en un mensaje legible.
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const delta of result.textStream) {
            if (delta) controller.enqueue(encoder.encode(delta))
          }
        } catch (error) {
          if (!request.signal.aborted) {
            console.error(`Error durante el streaming del paso "${body.step}":`, error)
            controller.enqueue(encoder.encode(STREAM_ERROR_MARKER))
          }
        } finally {
          controller.close()
        }
      },
    })
    return new Response(stream, { headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" } })
  } catch (error) {
    console.error(`Error al iniciar el paso "${body.step}":`, error)
    return json({ error: "No se pudo generar esta sección. Intenta de nuevo." }, 502)
  }
}
