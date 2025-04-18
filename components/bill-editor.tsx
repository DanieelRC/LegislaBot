"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Edit2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface BillEditorProps {
  billContent: string
  onSave: (updatedContent: string) => void
}

export function BillEditor({ billContent, onSave }: BillEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(billContent)

  // Extraer las secciones principales
  const sections = billContent.split(/\n\n+/)
  const titleIndex = sections.findIndex((s) => s.trim().toUpperCase() === s.trim())
  const expositionIndex = sections.findIndex((s) => s.includes("EXPOSICIÓN DE MOTIVOS"))
  const proposalIndex = sections.findIndex((s) => s.includes("PROPUESTA"))

  // Extraer el título, exposición y propuesta
  const title = titleIndex >= 0 ? sections[titleIndex] : ""
  const exposition =
    expositionIndex >= 0
      ? sections.slice(expositionIndex, proposalIndex).join("\n\n").replace("EXPOSICIÓN DE MOTIVOS", "").trim()
      : ""
  const proposal =
    proposalIndex >= 0 && proposalIndex < sections.length - 1
      ? sections.slice(proposalIndex, -1).join("\n\n").replace("PROPUESTA", "").trim()
      : ""
  const footer = sections[sections.length - 1] || ""

  const [editedTitle, setEditedTitle] = useState(title)
  const [editedExposition, setEditedExposition] = useState(exposition)
  const [editedProposal, setEditedProposal] = useState(proposal)

  const handleSave = () => {
    // Reconstruir el contenido completo
    const updatedContent = `${editedTitle}\n\nEXPOSICIÓN DE MOTIVOS\n\n${editedExposition}\n\nPROPUESTA\n\n${editedProposal}\n\n${footer}`
    onSave(updatedContent)
    setEditedContent(updatedContent)
    setIsEditing(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Edit2 className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editor de Proyecto de Ley</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="title" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="title">Título</TabsTrigger>
            <TabsTrigger value="exposition">Exposición de Motivos</TabsTrigger>
            <TabsTrigger value="proposal">Propuesta</TabsTrigger>
          </TabsList>

          <TabsContent value="title" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Iniciativa</Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="font-bold"
              />
              <p className="text-xs text-gray-500">El título debe ser descriptivo y estar en mayúsculas.</p>
            </div>
          </TabsContent>

          <TabsContent value="exposition" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exposition">Exposición de Motivos</Label>
              <Textarea
                id="exposition"
                value={editedExposition}
                onChange={(e) => setEditedExposition(e.target.value)}
                className="min-h-[300px]"
              />
              <p className="text-xs text-gray-500">
                La exposición de motivos debe incluir argumentos jurídicos y técnicos que fundamentan la propuesta.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="proposal" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposal">Propuesta</Label>
              <Textarea
                id="proposal"
                value={editedProposal}
                onChange={(e) => setEditedProposal(e.target.value)}
                className="min-h-[300px]"
              />
              <p className="text-xs text-gray-500">
                La propuesta debe incluir el articulado completo, utilizando "Artículo ÚNICO" o "Artículo PRIMERO,
                SEGUNDO..." según corresponda.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4 mr-1" />
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
