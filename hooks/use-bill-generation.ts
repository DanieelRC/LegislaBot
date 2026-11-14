"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { composeBill, parseOutline, type OutlineEntry } from "@/lib/bill-parser"

export type StepKind = "research" | "outline" | "exposition" | "title" | "closing"
export type StepStatus = "pending" | "active" | "done" | "error"
export type Phase = "idle" | "running" | "paused" | "done"

export interface Step {
  id: string
  kind: StepKind
  label: string
  description: string
  index?: number
  text: string
  status: StepStatus
}

interface GenerationState {
  phase: Phase
  topic: string
  mode: "live" | "demo" | null
  demoReason: string | null
  steps: Step[]
  lawTitle: string
  outline: OutlineEntry[]
  error: string | null
}

const STORAGE_KEY = "legislabot:generation"

const baseSteps = (): Step[] => [
  { id: "research", kind: "research", label: "Investigación", description: "Marco legal y fuentes", text: "", status: "pending" },
  { id: "outline", kind: "outline", label: "Estructura", description: "Título y esquema de la ley", text: "", status: "pending" },
  { id: "exposition", kind: "exposition", label: "Exposición de motivos", description: "Considerandos", text: "", status: "pending" },
  { id: "closing", kind: "closing", label: "Transitorios y referencias", description: "Cierre del documento", text: "", status: "pending" },
]

const initialState: GenerationState = {
  phase: "idle",
  topic: "",
  mode: null,
  demoReason: null,
  steps: [],
  lawTitle: "",
  outline: [],
  error: null,
}

/**
 * Orquesta la generación paso a paso. Cada sección es una petición corta en streaming,
 * de modo que ninguna se acerca al límite de tiempo del servidor y el texto se ve en vivo.
 */
export function useBillGeneration() {
  const [state, setState] = useState<GenerationState>(initialState)
  const stateRef = useRef(state)
  const tokenRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const update = useCallback((patch: Partial<GenerationState> | ((s: GenerationState) => GenerationState)) => {
    const next = typeof patch === "function" ? patch(stateRef.current) : { ...stateRef.current, ...patch }
    stateRef.current = next
    setState(next)
  }, [])

  const patchStep = useCallback(
    (id: string, patch: Partial<Step>) =>
      update((s) => ({ ...s, steps: s.steps.map((st) => (st.id === id ? { ...st, ...patch } : st)) })),
    [update],
  )

  const persist = useCallback(() => {
    try {
      const s = stateRef.current
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, token: tokenRef.current }))
    } catch {
      // almacenamiento no disponible: se continúa sin persistir
    }
  }, [])

  // Recupera una generación interrumpida por una recarga
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as GenerationState & { token: string | null }
      if (!saved.steps?.length) return
      tokenRef.current = saved.token
      const steps = saved.steps.map((st) => (st.status === "done" ? st : { ...st, status: "pending" as const, text: "" }))
      const finished = steps.every((st) => st.status === "done")
      update({ ...saved, steps, phase: finished ? "done" : "paused", error: null })
    } catch {
      // estado corrupto: se ignora
    }
  }, [update])

  const streamStep = useCallback(
    async (step: Step, signal: AbortSignal): Promise<string> => {
      const s = stateRef.current
      const research = s.steps.find((st) => st.kind === "research")?.text ?? ""
      const common = { topic: s.topic, token: tokenRef.current, research }
      const body =
        step.kind === "research"
          ? { step: "research", topic: s.topic }
          : step.kind === "outline"
            ? { step: "outline", ...common }
            : step.kind === "exposition"
              ? { step: "exposition", ...common, lawTitle: s.lawTitle }
              : step.kind === "title"
                ? { step: "title", ...common, lawTitle: s.lawTitle, outline: s.outline, index: step.index }
                : { step: "closing", ...common, lawTitle: s.lawTitle, outline: s.outline }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      })
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? "No se pudo generar esta sección.")
      }

      tokenRef.current = response.headers.get("X-Generation-Token") ?? tokenRef.current
      const mode = response.headers.get("X-Generation-Mode")
      if (mode === "live" || mode === "demo") {
        update({ mode, demoReason: response.headers.get("X-Demo-Reason") ?? stateRef.current.demoReason })
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let text = ""
      let lastPaint = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        const now = performance.now()
        if (now - lastPaint > 40) {
          lastPaint = now
          patchStep(step.id, { text })
        }
      }
      text += decoder.decode()
      if (!text.trim()) throw new Error("La sección llegó vacía. Intenta de nuevo.")
      return text.trim()
    },
    [patchStep, update],
  )

  const run = useCallback(async () => {
    const controller = new AbortController()
    abortRef.current = controller
    update({ phase: "running", error: null })

    try {
      for (;;) {
        const step = stateRef.current.steps.find((st) => st.status !== "done")
        if (!step) break
        patchStep(step.id, { status: "active", text: "" })
        const text = await streamStep(step, controller.signal)
        patchStep(step.id, { status: "done", text })

        if (step.kind === "outline") {
          const { lawTitle, items } = parseOutline(text)
          if (!lawTitle || items.length === 0) {
            patchStep(step.id, { status: "error" })
            throw new Error("No se pudo interpretar la estructura de la ley. Intenta de nuevo.")
          }
          const titleSteps: Step[] = items.map((item, index) => ({
            id: `title-${index}`,
            kind: "title",
            index,
            label: item.heading,
            description: item.range,
            text: "",
            status: "pending",
          }))
          update((s) => {
            const rest = s.steps.filter((st) => st.kind !== "title")
            const closingAt = rest.findIndex((st) => st.kind === "closing")
            return {
              ...s,
              lawTitle,
              outline: items,
              steps: [...rest.slice(0, closingAt), ...titleSteps, ...rest.slice(closingAt)],
            }
          })
        }
        persist()
      }
      update({ phase: "done" })
      persist()
    } catch (error) {
      const aborted = controller.signal.aborted
      update((s) => ({
        ...s,
        phase: "paused",
        error: aborted ? null : error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        steps: s.steps.map((st) =>
          st.status === "active" ? { ...st, status: aborted ? "pending" : "error", text: "" } : st,
        ),
      }))
      persist()
    } finally {
      abortRef.current = null
    }
  }, [patchStep, persist, streamStep, update])

  const start = useCallback(
    (topic: string) => {
      tokenRef.current = null
      update({ ...initialState, topic: topic.trim(), steps: baseSteps() })
      void run()
    },
    [run, update],
  )

  /** Continúa desde el primer paso sin terminar, conservando lo ya generado. */
  const resume = useCallback(() => {
    update((s) => ({ ...s, steps: s.steps.map((st) => (st.status === "error" ? { ...st, status: "pending" } : st)) }))
    void run()
  }, [run, update])

  const cancel = useCallback(() => abortRef.current?.abort(), [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    tokenRef.current = null
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // sin almacenamiento
    }
    update(initialState)
  }, [update])

  const documentText = useMemo(() => {
    const byKind = (kind: StepKind) => state.steps.filter((st) => st.kind === kind)
    return composeBill({
      lawTitle: state.lawTitle,
      exposition: byKind("exposition")[0]?.text ?? "",
      titles: byKind("title").map((st) => st.text),
      closing: byKind("closing")[0]?.text ?? "",
    })
  }, [state.lawTitle, state.steps])

  const activeStep = state.steps.find((st) => st.status === "active") ?? null
  const research = state.steps.find((st) => st.kind === "research")?.text ?? ""

  return { ...state, documentText, activeStep, research, start, resume, cancel, reset }
}
