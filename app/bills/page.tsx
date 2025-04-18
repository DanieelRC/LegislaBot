import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Toaster } from "@/components/ui/toaster"
import { DraftList } from "@/components/draft-list"

export default function BillsPage() {

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            {/* Título de la página */}
            <h1 className="text-2xl font-bold">Proyectos de Ley (Borradores)</h1>
            {/* Botón para ir a la página principal o de creación */}
            <Link href="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </Link>
          </div>

          {/* Renderizamos directamente el componente que maneja los borradores */}
          <div className="mt-6">
            <DraftList />
          </div>

        </div>
      </main>
      <Footer />
      <Toaster />
    </>
  )
}