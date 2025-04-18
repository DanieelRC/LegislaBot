"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Check, Save } from "lucide-react"
import { PdfGenerator } from "./pdf-generator"
import { BillEditor } from "./bill-editor"
import { FormatValidator } from "./format-validator"
import { AdvancedExport } from "./advanced-export"
import { saveDraft } from "@/app/actions/save-draft" // Asumiendo que esta acción existe y funciona
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

interface BillPreviewProps {
  billContent: string
}

export function BillPreview({ billContent }: BillPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [content, setContent] = useState(billContent)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "proyecto-de-ley.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      // Extraer el título del contenido (simple, toma la primera línea)
      const lines = content.split("\n")
      // Intenta encontrar una línea que parezca un título (mayúsculas o corta)
      const potentialTitle = lines.find(line => line.trim() && (line.trim() === line.trim().toUpperCase() || line.trim().length < 80)) || lines[0] || "Proyecto de Ley";
      const title = potentialTitle.trim() || "Proyecto de Ley";


      await saveDraft(title, content) // Llama a la acción para guardar
      toast({
        title: "Borrador guardado",
        description: "Tu proyecto de ley ha sido guardado correctamente.",
        // Podrías añadir una acción para ir a la lista de borradores si tienes esa ruta
        // action: <ToastAction altText="Ver borradores" onClick={() => window.location.href='/bills'}>Ver borradores</ToastAction>,
      })
    } catch (error) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el borrador. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Esta función se pasa a BillEditor
  const handleContentUpdate = (updatedContent: string) => {
    setContent(updatedContent)
    // Podrías añadir un toast si quieres confirmar la actualización en la vista previa
    // toast({
    //   title: "Vista previa actualizada",
    //   description: "Los cambios se reflejan en la vista previa.",
    // })
  }

  // Extraer el título para el PDF (usando la misma lógica que en handleSaveDraft)
  const pdfLines = content.split("\n")
  const pdfPotentialTitle = pdfLines.find(line => line.trim() && (line.trim() === line.trim().toUpperCase() || line.trim().length < 80)) || pdfLines[0] || "Proyecto de Ley";
  const pdfTitle = pdfPotentialTitle.trim() || "Proyecto de Ley";


  // Formatear el contenido para la visualización
  const sections = content.split(/\n\n+/) // Divide por uno o más saltos de línea

  // Identificar las secciones principales (más robusto)
  const titleIndex = sections.findIndex((s) => s.trim() && (s.trim() === s.trim().toUpperCase() || s.trim().length < 80) && !s.includes("EXPOSICIÓN DE MOTIVOS") && !s.includes("PROPUESTA"));
  const expositionIndex = sections.findIndex((s) => s.toUpperCase().includes("EXPOSICIÓN DE MOTIVOS"))
  const proposalIndex = sections.findIndex((s) => s.toUpperCase().includes("PROPUESTA"))

  // Formatear cada sección para la visualización
  const formattedContent = (
    <div className="space-y-6">
      {sections.map((section, i) => {
        const trimmedSection = section.trim();
        if (!trimmedSection) return null; // Ignorar secciones vacías

        // Determinar el estilo basado en la sección
        if (i === titleIndex) {
          return (
            <h1 key={i} className="text-2xl font-bold text-center my-6">
              {trimmedSection}
            </h1>
          )
        } else if (i === expositionIndex) {
          return (
            <div key={i} className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-left">EXPOSICIÓN DE MOTIVOS</h2>
              {/* CORRECCIÓN: Cambiado text-justify a text-left */}
              <div className="text-left">
                {trimmedSection
                  .replace(/EXPOSICIÓN DE MOTIVOS/i, "") // Case-insensitive replace
                  .trim()
                  .split("\n") // Divide por saltos de línea *dentro* de la sección
                  .map((para, j) => para.trim() && ( // Ignora párrafos vacíos dentro
                    <p key={j} className="mb-4">
                      {para.trim()}
                    </p>
                  ))}
              </div>
            </div>
          )
        } else if (i === proposalIndex) {
          return (
            <div key={i} className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-left">PROPUESTA</h2>
              {/* CORRECCIÓN: Cambiado text-justify a text-left */}
              <div className="text-left">
                {trimmedSection
                  .replace(/PROPUESTA/i, "") // Case-insensitive replace
                  .trim()
                  .split("\n")
                  .map((para, j) => para.trim() && ( // Ignora párrafos vacíos dentro
                    <p key={j} className={`mb-4 ${para.trim().match(/^Artículo \d+\.?/) ? "font-semibold" : ""}`}>
                      {para.trim()}
                    </p>
                  ))}
              </div>
            </div>
          )
        } else if (i > proposalIndex && proposalIndex !== -1) { // Asegura que proposalIndex fue encontrado
          // Asumimos que es la parte final (lugar, fecha, nombre) - Mantenemos text-right
          return (
            <p key={i} className="text-right italic mt-8">
              {trimmedSection}
            </p>
          )
        } else {
          // Otros párrafos (antes de exposición, o si no se encontraron las secciones)
          // CORRECCIÓN: Cambiado text-justify a text-left
          return (
            <div key={i} className="text-left">
              {trimmedSection.split("\n").map((para, j) => para.trim() && ( // Ignora párrafos vacíos dentro
                <p key={j} className="mb-4">
                  {para.trim()}
                </p>
              ))}
            </div>
          )
        }
      })}
    </div>
  )

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2"> {/* Añadido flex-wrap y gap */}
        <h3 className="text-lg font-medium">Proyecto de Ley Generado</h3>
        <div className="flex space-x-2 flex-wrap gap-2"> {/* Añadido flex-wrap y gap */}
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center">
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Texto
          </Button>
          <PdfGenerator billContent={content} title={pdfTitle} />
          <AdvancedExport billContent={content} title={pdfTitle} />
          <BillEditor billContent={content} onSave={handleContentUpdate} />
          <FormatValidator billContent={content} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Vista Previa</TabsTrigger>
          <TabsTrigger value="raw">Texto Plano</TabsTrigger>
          <TabsTrigger value="format">Formato Oficial</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="p-4 bg-gray-50 rounded-md text-black">
          {/* CORRECCIÓN: Añadido text-left aquí también por si acaso */}
          <div className="prose max-w-none text-black text-left">{formattedContent}</div>
        </TabsContent>
        <TabsContent value="raw">
          {/* CORRECCIÓN: Añadido text-left aquí también */}
          <pre className="p-4 bg-gray-50 rounded-md overflow-auto text-sm whitespace-pre-wrap text-black text-left">{content}</pre>
        </TabsContent>
        <TabsContent value="format" className="p-4 bg-gray-50 rounded-md text-black">
          {/* CORRECCIÓN: Añadido text-left al contenedor principal */}
          <div className="prose max-w-none text-left">
            <p className="text-sm text-gray-500 mb-4">
              El documento final cumple con las siguientes especificaciones de formato:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Interlineado a 1.5</li>
              <li>Tamaño carta</li>
              <li>Letra Arial de 12 puntos</li>
              <li>Doble espacio entre cada párrafo</li>
              <li>Páginas numeradas</li>
              <li>Formato PDF para la versión final</li>
            </ul>
            <p className="text-sm text-gray-500 mt-4">La estructura del documento sigue el formato oficial:</p>
            <ol className="list-decimal pl-5 text-sm text-gray-600">
              <li>Título de la iniciativa</li>
              <li>Exposición de motivos</li>
              <li>Propuesta (articulado)</li>
              <li>Lugar, fecha y nombre del proponente</li>
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}