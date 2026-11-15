import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DraftList } from "@/components/draft-list"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Borradores" }

export default function BillsPage() {
  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Tu archivo</p>
          <h1 className="mt-2 text-4xl font-semibold">Borradores</h1>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus /> Nuevo proyecto
          </Link>
        </Button>
      </div>
      <DraftList />
    </div>
  )
}
