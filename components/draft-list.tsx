"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Trash2, Clock, Eye } from "lucide-react"
import { getDrafts, deleteDraft } from "@/app/actions/save-draft"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BillPreview } from "@/components/bill-preview"

// Ajustada para coincidir con lo que devuelve getDrafts
interface Draft {
  id: string
  title: string
  content: string
  created_at: string  // Cambiado de createdAt a created_at
}

export function DraftList() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const loadDrafts = async () => {
    setIsLoading(true)
    try {
      const loadedDrafts = await getDrafts()
      setDrafts(loadedDrafts)
    } catch (error) {
      console.error("Error loading drafts:", error)
      toast({
        title: "Error al cargar borradores",
        description: "No se pudieron cargar los borradores guardados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDrafts()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const success = await deleteDraft(id)
      if (success) {
        setDrafts(drafts.filter((draft) => draft.id !== id))
        toast({
          title: "Borrador eliminado",
          description: "El borrador ha sido eliminado correctamente.",
        })
      } else {
        throw new Error("No se pudo eliminar el borrador")
      }
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el borrador. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (draft: Draft) => {
    setSelectedDraft(draft)
    setIsDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return "Fecha no disponible"
      }

      return new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Fecha no disponible"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Borradores Guardados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No hay borradores guardados</p>
              <p className="text-sm mt-2">Los proyectos de ley que guardes aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <div key={draft.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{draft.title}</h3>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(draft.created_at)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(draft)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(draft.id)}
                        disabled={deletingId === draft.id}
                      >
                        {deletingId === draft.id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa del Borrador</DialogTitle>
          </DialogHeader>
          {selectedDraft && <BillPreview billContent={selectedDraft.content || ""} />}
        </DialogContent>
      </Dialog>
    </>
  )
}