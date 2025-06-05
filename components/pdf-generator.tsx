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

      // Márgenes oficiales
      const marginLeft = 30; // 3cm
      const marginRight = 30;
      const marginTop = 25; // 2.5cm
      const marginBottom = 25;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const textWidth = pageWidth - marginLeft - marginRight;

      // Configurar metadatos
      doc.setProperties({
        title: title,
        subject: 'Proyecto de Ley',
        author: 'LegislaBot',
        creator: 'LegislaBot PDF Generator'
      });

      // Encabezado oficial (puedes agregar imagen si tienes base64)
      // doc.addImage(escudoCDMX, 'PNG', marginLeft, marginTop - 15, 20, 20);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('CONGRESO DE LA CIUDAD DE MÉXICO', pageWidth / 2, marginTop, { align: 'center' });

      doc.setFontSize(12);
      doc.text('DECRETO', pageWidth / 2, marginTop + 10, { align: 'center' });

      // Título con ajuste automático de tamaño y líneas
      doc.setFont('helvetica', 'bold');
      const titleFontSize = title.length > 50 ? 14 : 16; // Reducir tamaño si es muy largo
      doc.setFontSize(titleFontSize);

      // Dividir el título en líneas para que encaje en el ancho
      const titleLines = doc.splitTextToSize(title.toUpperCase(), textWidth);
      let titleYPosition = marginTop + 22;

      // Dibujar cada línea del título centrada
      for (const line of titleLines) {
        doc.text(line, pageWidth / 2, titleYPosition, { align: 'center' });
        titleYPosition += titleFontSize * 0.5;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);

      let yPosition = titleYPosition + 15; // Ajustar la posición inicial según el título
      const lineHeight = 7.5; // 1.5 interlineado para 12pt

      // Separar en párrafos dobles
      const sections = billContent.split(/\n\s*\n/);
      for (const section of sections) {
        if (!section.trim()) continue;
        const lines = doc.splitTextToSize(section.trim(), textWidth);
        for (const line of lines) {
          if (yPosition + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            yPosition = marginTop;
          }
          // Agregar justificación al texto
          doc.text(line, marginLeft, yPosition, { align: 'justify' });
          yPosition += lineHeight;
        }
        yPosition += lineHeight * 2; // Doble espacio entre párrafos
      }

      // Numerar páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      setProgress(100);
      doc.save('decreto-legislativo-cdmx.pdf');

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
