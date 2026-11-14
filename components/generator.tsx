"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Circle, AlertCircle, Info, Loader2, Play, RotateCcw, Square } from "lucide-react"
import { BillDocument } from "@/components/bill-document"
import { BillWorkspace } from "@/components/bill-workspace"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useBillGeneration, type Step } from "@/hooks/use-bill-generation"
import { cn } from "@/lib/utils"
import { TOPIC_MAX } from "@/lib/validation"

const SUGGESTIONS = [
  "Deepfakes y suplantación de identidad",
  "Transparencia algorítmica en trámites públicos",
  "Uso de IA en videovigilancia urbana",
  "IA generativa en la educación básica",
]

interface Health {
  database: boolean
  ai: "live" | "demo"
}

function DemoNotice({ reason }: { reason: string | null }) {
  return (
    <div role="status" className="flex gap-3 rounded-md border border-gold/40 bg-gold/10 p-4 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
      <p>
        <strong className="font-semibold">Modo demostración.</strong>{" "}
        {reason === "limit"
          ? "Se alcanzó el límite diario de generaciones con IA para tu conexión."
          : "Este despliegue no tiene la IA configurada."}{" "}
        El documento es una muestra fija que recorre el mismo flujo en tiempo real; no corresponde al tema que escribiste.
      </p>
    </div>
  )
}

function StepIcon({ status }: { status: Step["status"] }) {
  if (status === "done") return <Check className="h-4 w-4 text-success" aria-label="Completado" />
  if (status === "active") return <Loader2 className="h-4 w-4 animate-spin text-primary" aria-label="En curso" />
  if (status === "error") return <AlertCircle className="h-4 w-4 text-destructive" aria-label="Con error" />
  return <Circle className="h-4 w-4 text-muted-foreground/50" aria-label="Pendiente" />
}

export function Generator() {
  const gen = useBillGeneration()
  const [topic, setTopic] = useState("")
  const [health, setHealth] = useState<Health | null>(null)
  const [follow, setFollow] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: Health) => setHealth(data))
      .catch(() => setHealth({ database: false, ai: "demo" }))
  }, [])

  // Sigue el texto mientras se escribe; se pausa si la persona se desplaza hacia arriba.
  const streamingText = gen.activeStep?.text ?? ""
  useEffect(() => {
    if (gen.phase === "running" && follow) endRef.current?.scrollIntoView({ block: "end" })
  }, [streamingText, gen.phase, follow])

  useEffect(() => {
    if (gen.phase !== "running") return
    const pause = (e: WheelEvent) => e.deltaY < 0 && setFollow(false)
    const pauseTouch = () => setFollow(false)
    window.addEventListener("wheel", pause, { passive: true })
    window.addEventListener("touchmove", pauseTouch, { passive: true })
    return () => {
      window.removeEventListener("wheel", pause)
      window.removeEventListener("touchmove", pauseTouch)
    }
  }, [gen.phase])

  // Al terminar, vuelve al inicio del documento
  useEffect(() => {
    if (gen.phase === "done") window.scrollTo({ top: 0 })
  }, [gen.phase])

  const submit = (value: string) => {
    const clean = value.trim()
    if (clean.length < 3) return
    setFollow(true)
    gen.start(clean)
  }

  // ---------- Inicio: presentación y compositor ----------
  if (gen.phase === "idle") {
    return (
      <section className="container max-w-4xl pb-8 pt-14 sm:pt-20">
        <p className="eyebrow">Técnica legislativa asistida por IA</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-6xl">
          Del tema al proyecto de ley, <em className="font-normal italic text-primary">artículo por artículo</em>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          LegislaBot investiga el marco jurídico, propone la estructura y redacta una iniciativa completa para la Ciudad
          de México. Ves cómo se escribe cada sección en tiempo real.
        </p>

        <form
          className="mt-10 rounded-md border bg-card p-4 shadow-sm sm:p-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit(topic)
          }}
        >
          <label htmlFor="topic" className="text-sm font-medium">
            ¿Qué quieres regular?
          </label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value.slice(0, TOPIC_MAX))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(topic)
            }}
            placeholder="Ej.: uso de sistemas de reconocimiento facial por autoridades de la Ciudad de México"
            rows={3}
            className="mt-2 resize-none border-0 bg-transparent px-0 text-lg shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-describedby="topic-help"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p id="topic-help" className="text-xs text-muted-foreground">
              <span className="tabular-nums">
                {topic.length}/{TOPIC_MAX}
              </span>{" "}
              · Ctrl + Enter para generar
              {health?.ai === "demo" && " · IA no configurada: verás una demostración"}
            </p>
            <Button type="submit" size="lg" disabled={topic.trim().length < 3}>
              Redactar proyecto <ArrowRight />
            </Button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Prueba con:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
            >
              {s}
            </button>
          ))}
          <Link href="/example" className="ml-auto text-sm font-medium text-primary underline-offset-4 hover:underline">
            Ver un ejemplo terminado
          </Link>
        </div>
      </section>
    )
  }

  // ---------- Documento terminado ----------
  if (gen.phase === "done") {
    return (
      <section className="container space-y-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Proyecto generado</p>
            <p className="mt-1 max-w-2xl text-muted-foreground">Tema: {gen.topic}</p>
          </div>
          <Button variant="outline" onClick={gen.reset}>
            <RotateCcw /> Nuevo proyecto
          </Button>
        </div>
        {gen.mode === "demo" && <DemoNotice reason={gen.demoReason} />}
        {health && !health.database && (
          <p className="text-sm text-muted-foreground">
            El guardado no está disponible en este momento; puedes copiar o exportar el documento.
          </p>
        )}
        <BillWorkspace initialContent={gen.documentText} canSave={Boolean(health?.database)} research={gen.research} />
      </section>
    )
  }

  // ---------- Generación en curso o en pausa ----------
  const running = gen.phase === "running"
  const done = gen.steps.filter((s) => s.status === "done").length
  const preparing = !gen.documentText && (gen.activeStep?.kind === "research" || gen.activeStep?.kind === "outline")

  return (
    <section className="container py-10">
      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="eyebrow">{running ? "Redactando" : "En pausa"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{gen.topic}</p>
          </div>

          <div
            className="h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Avance de la generación"
            aria-valuemin={0}
            aria-valuemax={gen.steps.length}
            aria-valuenow={done}
          >
            <div
              className="h-full bg-primary transition-[width] duration-500"
              style={{ width: `${(done / Math.max(gen.steps.length, 1)) * 100}%` }}
            />
          </div>

          <ol className="space-y-2.5 text-sm" aria-live="polite">
            {gen.steps.map((step) => (
              <li key={step.id} className="flex gap-2.5">
                <span className="mt-0.5">
                  <StepIcon status={step.status} />
                </span>
                <span className={cn(step.status === "pending" && "text-muted-foreground")}>
                  <span className={cn("block leading-snug", step.status === "active" && "font-medium")}>{step.label}</span>
                  <span className="block text-xs text-muted-foreground">{step.description}</span>
                </span>
              </li>
            ))}
          </ol>

          {gen.error && (
            <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {gen.error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {running ? (
              <Button variant="outline" size="sm" onClick={gen.cancel}>
                <Square /> Detener
              </Button>
            ) : (
              <Button size="sm" onClick={gen.resume}>
                <Play /> {gen.error ? "Reintentar paso" : "Continuar"}
              </Button>
            )}
            {running && !follow && (
              <Button variant="ghost" size="sm" onClick={() => setFollow(true)}>
                Seguir el texto
              </Button>
            )}
            {!running && (
              <Button variant="ghost" size="sm" onClick={gen.reset}>
                Descartar
              </Button>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {gen.mode === "demo" && <DemoNotice reason={gen.demoReason} />}

          {preparing ? (
            <div className="mx-auto max-w-[52rem] rounded-sm border bg-card p-6 sm:p-10">
              <p className="eyebrow mb-4">
                {gen.activeStep?.kind === "research" ? "Notas de investigación" : "Estructura propuesta"}
              </p>
              <p
                className={cn(
                  "whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground",
                  running && "typing-cursor",
                )}
              >
                {gen.activeStep?.text || "Consultando el marco jurídico aplicable…"}
              </p>
            </div>
          ) : (
            <BillDocument text={gen.documentText} streaming={running} />
          )}
          <div ref={endRef} className="h-px scroll-mb-24" />
        </div>
      </div>
    </section>
  )
}
