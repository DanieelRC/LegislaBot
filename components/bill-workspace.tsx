"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Check, AlertCircle, Copy, Download, FileSearch, Loader2, PenLine, Save } from "lucide-react"
import { saveDraft } from "@/app/actions/drafts"
import { BillDocument } from "@/components/bill-document"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { parseBill, validateBill } from "@/lib/bill-parser"
import { exportPdf, exportTxt, exportWord } from "@/lib/export"

interface BillWorkspaceProps {
  initialContent: string
  /** Permite guardar como borrador (requiere base de datos). */
  canSave?: boolean
  /** Informe de investigación que sustentó la redacción, si existe. */
  research?: string
}

/** Documento terminado: índice, validación de formato, edición, guardado y exportación. */
export function BillWorkspace({ initialContent, canSave = false, research }: BillWorkspaceProps) {
  const [content, setContent] = useState(initialContent)
  const [draft, setDraft] = useState(initialContent)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const parsed = useMemo(() => parseBill(content), [content])
  const checks = useMemo(() => validateBill(parsed), [parsed])
  const passed = checks.filter((c) => c.ok).length

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "No se pudo copiar", description: "Tu navegador bloqueó el acceso al portapapeles.", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await saveDraft(parsed.title.slice(0, 255) || "Proyecto de ley", content)
    setSaving(false)
    if (result.ok) {
      setSavedId(result.id)
      toast({ title: "Borrador guardado", description: "Lo encontrarás en «Borradores»." })
    } else {
      toast({ title: "No se pudo guardar", description: result.error, variant: "destructive" })
    }
  }

  const handleExport = async (kind: "pdf" | "word" | "txt") => {
    setExporting(true)
    try {
      if (kind === "pdf") await exportPdf(content)
      else if (kind === "word") exportWord(content)
      else exportTxt(content)
    } catch (error) {
      console.error(error)
      toast({ title: "No se pudo exportar", description: "Intenta con otro formato.", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  const applyEdit = () => {
    setContent(draft.trim())
    setSavedId(null)
    setEditing(false)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="no-print space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
        <nav aria-label="Índice del documento">
          <p className="eyebrow mb-3">Índice</p>
          {parsed.toc.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin secciones detectadas.</p>
          ) : (
            <ul className="space-y-1 border-l text-sm">
              {parsed.toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`-ml-px block border-l border-transparent py-1 text-muted-foreground hover:border-gold hover:text-foreground ${
                      item.level === 1 ? "pl-3 font-medium text-foreground" : "pl-6"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <section aria-label="Validación de formato">
          <p className="eyebrow mb-3">
            Formato oficial · {passed}/{checks.length}
          </p>
          <ul className="space-y-2 text-sm">
            {checks.map((check) => (
              <li key={check.label} className="flex gap-2">
                {check.ok ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Cumple" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-label="Falta" />
                )}
                <span>
                  {check.label}
                  {!check.ok && <span className="block text-xs text-muted-foreground">{check.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Artículos</dt>
            <dd className="font-serif text-2xl tabular-nums">{parsed.stats.articles}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Palabras</dt>
            <dd className="font-serif text-2xl tabular-nums">{parsed.stats.words.toLocaleString("es-MX")}</dd>
          </div>
        </dl>
      </aside>

      <div className="min-w-0">
        <div className="no-print mb-4 flex flex-wrap items-center justify-end gap-2">
          {research && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FileSearch /> Investigación
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif">Informe de investigación</DialogTitle>
                  <DialogDescription>Fuentes y contexto que se usaron para redactar el proyecto.</DialogDescription>
                </DialogHeader>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{research}</p>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />} {copied ? "Copiado" : "Copiar"}
          </Button>

          <Dialog
            open={editing}
            onOpenChange={(open) => {
              setEditing(open)
              if (open) setDraft(content)
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PenLine /> Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="font-serif">Editar el texto</DialogTitle>
                <DialogDescription>
                  Cada encabezado va en su propia línea (TÍTULO, CAPÍTULO, «Artículo N.»). La vista y el índice se
                  actualizan al aplicar.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Texto del proyecto de ley"
                className="h-[60vh] resize-none font-serif text-base leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={applyEdit} disabled={draft.trim().length < 20}>
                  Aplicar cambios
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" disabled={exporting}>
                {exporting ? <Loader2 className="animate-spin" /> : <Download />} Exportar
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-1">
              {(
                [
                  ["pdf", "PDF oficial", "Carta, 12 pt, interlineado 1.5"],
                  ["word", "Word (.doc)", "Editable en Word o Google Docs"],
                  ["txt", "Texto plano", "Sin formato"],
                ] as const
              ).map(([kind, label, hint]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleExport(kind)}
                  className="block w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {label}
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {canSave &&
            (savedId ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={`/bills/${savedId}`}>
                  <Check /> Guardado · ver
                </Link>
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />} Guardar borrador
              </Button>
            ))}
        </div>

        <BillDocument text={content} />
      </div>
    </div>
  )
}
