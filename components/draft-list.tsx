"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { FileText, Loader2, Search, Trash2 } from "lucide-react"
import { deleteDraft, listDrafts, type DraftSummary } from "@/app/actions/drafts"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

const dateFormat = new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" })

export function DraftList() {
  const [drafts, setDrafts] = useState<DraftSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [toDelete, setToDelete] = useState<DraftSummary | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    listDrafts().then((result) => {
      if (result.ok) setDrafts(result.drafts)
      else {
        setDrafts([])
        setError(result.error)
      }
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (drafts ?? []).filter((d) => !q || d.title.toLowerCase().includes(q) || d.excerpt.toLowerCase().includes(q))
  }, [drafts, query])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteDraft(toDelete.id)
    setDeleting(false)
    if (result.ok) {
      setDrafts((prev) => (prev ?? []).filter((d) => d.id !== toDelete.id))
      toast({ title: "Borrador eliminado" })
    } else {
      toast({ title: "No se pudo eliminar", description: result.error, variant: "destructive" })
    }
    setToDelete(null)
  }

  if (drafts === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy aria-label="Cargando borradores">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-md border bg-card" />
        ))}
      </div>
    )
  }

  if (drafts.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-card px-6 py-16 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">{error ? "Borradores no disponibles" : "Aún no hay borradores"}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {error ??
            "Los proyectos que guardes aparecerán aquí. Son privados: solo se muestran en este navegador."}
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Redactar un proyecto</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título o contenido"
          aria-label="Buscar borradores"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ningún borrador coincide con «{query}».</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((draft) => (
            <li
              key={draft.id}
              className="group relative flex flex-col rounded-md border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <time dateTime={draft.createdAt} className="text-xs text-muted-foreground">
                {dateFormat.format(new Date(draft.createdAt))}
              </time>
              <h2 className="mt-2 line-clamp-3 font-serif text-lg font-semibold leading-snug">
                <Link href={`/bills/${draft.id}`} className="after:absolute after:inset-0">
                  {draft.title}
                </Link>
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {draft.excerpt.replace(draft.title, "").replace(/\s+/g, " ").trim()}
              </p>
              <div className="relative z-10 mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setToDelete(draft)}
                >
                  <Trash2 /> Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">¿Eliminar este borrador?</DialogTitle>
            <DialogDescription>«{toDelete?.title}» se eliminará de forma permanente.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />} Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
