"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface PdfGeneratorProps {
  billContent: string
  title: string
}

export function PdfGenerator({ billContent, title }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simular progreso
    const updateProgress = () => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
        }
      }, 200);
      return interval;
    };

    const progressInterval = updateProgress();

    try {
      // Crear el documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      // Definir márgenes
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const textWidth = pageWidth - (margin * 2);

      // Configurar metadatos
      doc.setProperties({
        title: title,
        subject: 'Proyecto de Ley',
        author: 'LegislaBot',
        creator: 'LegislaBot PDF Generator'
      });

      // Usar fuente helvetica (similar a Arial)
      doc.setFont('helvetica', 'normal');

      // Añadir título centrado
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, margin, { align: 'center' });

      // Establecer fuente para el contenido
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // … dentro de generatePDF(), reemplaza el bucle for de secciones por esto:

      // Separar en párrafos
      const sections = billContent.split("\n\n")
      let yPosition = margin + 15
      const lineHeight = doc.getLineHeightFactor() * doc.getFontSize()

      for (const section of sections) {
        if (!section.trim()) continue

        // Ajustar líneas al ancho
        const lines = doc.splitTextToSize(section, textWidth)

        for (const line of lines) {
          // Nueva página si nos pasamos del margen inferior
          if (yPosition + lineHeight > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(line, margin, yPosition)
          yPosition += lineHeight
        }

        // Espacio extra entre párrafos
        yPosition += lineHeight
      }

      // Numerar páginas…
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(10)
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        })
      }
      // Asegurar que el progreso llegue al 100%
      setProgress(100);

      // Descargar el PDF
      doc.save('proyecto-de-ley.pdf');

      // Limpiar y cerrar
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setIsOpen(false);
      }, 500);

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      clearInterval(progressInterval);
      setIsGenerating(false);
      alert("Error al generar el PDF: " + (error instanceof Error ? error.message : "Error desconocido"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generación de PDF con Formato Oficial</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            El PDF generado cumplirá con todas las especificaciones del formato oficial:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 mb-6">
            <li>Interlineado a 1.5</li>
            <li>Tamaño carta</li>
            <li>Letra Arial de 12 puntos</li>
            <li>Doble espacio entre cada párrafo</li>
            <li>Páginas numeradas</li>
          </ul>

          {isGenerating ? (
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-gray-500">Generando PDF con formato oficial... {progress}%</p>
            </div>
          ) : (
            <Button onClick={generatePDF} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Generar y Descargar PDF
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
