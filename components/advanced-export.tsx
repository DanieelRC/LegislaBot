"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface AdvancedExportProps {
  billContent: string
  title: string
}

interface ExportSettings {
  format: "pdf" | "docx" | "txt"
  template: "official" | "simple" | "detailed"
  includePageNumbers: boolean
  includeWatermark: boolean
  includeHeader: boolean
  includeFooter: boolean
  headerText: string
  footerText: string
  fontSize: "small" | "medium" | "large"
  orientation: "portrait" | "landscape"
}

export function AdvancedExport({ billContent, title }: AdvancedExportProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview")
  const [settings, setSettings] = useState<ExportSettings>({
    format: "pdf",
    template: "official",
    includePageNumbers: true,
    includeWatermark: false,
    includeHeader: true,
    includeFooter: true,
    headerText: "Congreso de la Ciudad de México",
    footerText: "Documento generado con LegisAI",
    fontSize: "medium",
    orientation: "portrait",
  })
  const { toast } = useToast()

  const updateSetting = <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const generateDocument = async () => {
    setIsGenerating(true)
    setProgress(0)

    // Simulación del proceso de generación
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      setProgress(i)
    }

    // En una implementación real, aquí se generaría el documento usando una biblioteca como jsPDF, pdfmake o una API
    // También se podría enviar los datos al servidor para generar el documento

    // Simular la descarga de un archivo
    setTimeout(() => {
      const extension = settings.format
      const blob = new Blob([billContent], { type: getContentType(settings.format) })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `proyecto-de-ley.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setIsGenerating(false)
      setIsOpen(false)

      toast({
        title: "Documento exportado",
        description: `El proyecto de ley ha sido exportado en formato ${settings.format.toUpperCase()}.`,
      })
    }, 500)
  }

  const getContentType = (format: string) => {
    switch (format) {
      case "pdf":
        return "application/pdf"
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      case "txt":
      default:
        return "text/plain"
    }
  }

  const formatLabel = {
    pdf: "PDF",
    docx: "Word (DOCX)",
    txt: "Texto plano (TXT)",
  }

  const templateLabel = {
    official: "Formato Oficial",
    simple: "Formato Simple",
    detailed: "Formato Detallado",
  }

  const fontSizeLabel = {
    small: "Pequeño (10pt)",
    medium: "Mediano (12pt)",
    large: "Grande (14pt)",
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Exportación Avanzada
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "preview" | "settings")}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="border rounded-md p-4 bg-white h-[400px] overflow-y-auto">
              <div className="max-w-[600px] mx-auto">
                {settings.includeHeader && (
                  <div className="text-center text-gray-500 text-sm mb-4 border-b pb-2">{settings.headerText}</div>
                )}

                <h1
                  className={`text-center font-bold mb-6 ${
                    settings.fontSize === "small" ? "text-lg" : settings.fontSize === "large" ? "text-2xl" : "text-xl"
                  }`}
                >
                  {title}
                </h1>

                <div
                  className={`text-justify ${
                    settings.fontSize === "small" ? "text-sm" : settings.fontSize === "large" ? "text-lg" : "text-base"
                  }`}
                >
                  {billContent.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {settings.includeFooter && (
                  <div className="text-center text-gray-500 text-sm mt-8 border-t pt-2">{settings.footerText}</div>
                )}

                {settings.includePageNumbers && <div className="text-center text-gray-500 text-sm mt-4">Página 1</div>}

                {settings.includeWatermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-45">
                    <span className="text-5xl font-bold text-gray-500">BORRADOR</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {templateLabel[settings.template]} • {formatLabel[settings.format]} •{" "}
                  {settings.orientation.charAt(0).toUpperCase() + settings.orientation.slice(1)}
                </span>
              </div>

              <Button onClick={() => setActiveTab("settings")} variant="outline" size="sm">
                Cambiar configuración
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Formato de exportación</Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value) => updateSetting("format", value as ExportSettings["format"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word (DOCX)</SelectItem>
                      <SelectItem value="txt">Texto plano (TXT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Plantilla</Label>
                  <Select
                    value={settings.template}
                    onValueChange={(value) => updateSetting("template", value as ExportSettings["template"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="official">Formato Oficial</SelectItem>
                      <SelectItem value="simple">Formato Simple</SelectItem>
                      <SelectItem value="detailed">Formato Detallado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tamaño de fuente</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value) => updateSetting("fontSize", value as ExportSettings["fontSize"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño (10pt)</SelectItem>
                      <SelectItem value="medium">Mediano (12pt)</SelectItem>
                      <SelectItem value="large">Grande (14pt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Orientación</Label>
                  <Select
                    value={settings.orientation}
                    onValueChange={(value) => updateSetting("orientation", value as ExportSettings["orientation"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar orientación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Vertical</SelectItem>
                      <SelectItem value="landscape">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includePageNumbers" className="cursor-pointer">
                    Incluir números de página
                  </Label>
                  <Switch
                    id="includePageNumbers"
                    checked={settings.includePageNumbers}
                    onCheckedChange={(checked) => updateSetting("includePageNumbers", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeWatermark" className="cursor-pointer">
                    Incluir marca de agua
                  </Label>
                  <Switch
                    id="includeWatermark"
                    checked={settings.includeWatermark}
                    onCheckedChange={(checked) => updateSetting("includeWatermark", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeHeader" className="cursor-pointer">
                    Incluir encabezado
                  </Label>
                  <Switch
                    id="includeHeader"
                    checked={settings.includeHeader}
                    onCheckedChange={(checked) => updateSetting("includeHeader", checked)}
                  />
                </div>

                {settings.includeHeader && (
                  <div className="space-y-2">
                    <Label htmlFor="headerText">Texto de encabezado</Label>
                    <Input
                      id="headerText"
                      value={settings.headerText}
                      onChange={(e) => updateSetting("headerText", e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeFooter" className="cursor-pointer">
                    Incluir pie de página
                  </Label>
                  <Switch
                    id="includeFooter"
                    checked={settings.includeFooter}
                    onCheckedChange={(checked) => updateSetting("includeFooter", checked)}
                  />
                </div>

                {settings.includeFooter && (
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Texto de pie de página</Label>
                    <Input
                      id="footerText"
                      value={settings.footerText}
                      onChange={(e) => updateSetting("footerText", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setActiveTab("preview")} variant="outline">
                Ver vista previa
              </Button>
              <Button onClick={generateDocument} className="bg-emerald-600 hover:bg-emerald-700">
                Aplicar configuración
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isGenerating && (
          <div className="space-y-4 mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center text-gray-500">
              Generando documento con formato {templateLabel[settings.template]}... {progress}%
            </p>
          </div>
        )}

        {!isGenerating && (
          <div className="flex justify-end mt-4">
            <Button onClick={generateDocument} className="bg-emerald-600 hover:bg-emerald-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar como {formatLabel[settings.format]}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
