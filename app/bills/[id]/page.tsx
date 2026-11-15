import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getDraft } from "@/app/actions/drafts"
import { BillWorkspace } from "@/components/bill-workspace"

export const metadata: Metadata = { title: "Borrador" }
export const dynamic = "force-dynamic"

export default async function DraftPage({ params }: { params: { id: string } }) {
  // getDraft solo devuelve el borrador si pertenece a la sesión actual
  const draft = await getDraft(params.id)
  if (!draft) notFound()

  return (
    <div className="container space-y-6 py-10">
      <Link href="/bills" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Borradores
      </Link>
      <p className="text-sm text-muted-foreground">
        Guardado el{" "}
        {new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(new Date(draft.createdAt))}
      </p>
      <BillWorkspace initialContent={draft.content} />
    </div>
  )
}
