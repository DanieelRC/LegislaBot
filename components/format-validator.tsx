"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FormatValidatorProps {
  billContent: string
}

interface ValidationResult {
  valid: boolean
  issues: string[]
  suggestions: string[]
}

export function FormatValidator({ billContent }: FormatValidatorProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateFormat = () => {
    setIsValidating(true)

    // Simulación de validación
    setTimeout(() => {
      const sections = billContent.split(/\n\n+/)
      const issues: string[] = []
      const suggestions: string[] = []

      // Validar título
      const titleIndex = sections.findIndex((s) => s.trim().toUpperCase() === s.trim())
      if (titleIndex === -1) {
        issues.push("No se encontró un título en mayúsculas")
        suggestions.push("Añade un título en mayúsculas al inicio del documento")
      }

      // Validar exposición de motivos
      const expositionIndex = sections.findIndex((s) => s.includes("EXPOSICIÓN DE MOTIVOS"))
      if (expositionIndex === -1) {
        issues.push("No se encontró la sección 'EXPOSICIÓN DE MOTIVOS'")
        suggestions.push("Añade una sección 'EXPOSICIÓN DE MOTIVOS' después del título")
      }

      // Validar propuesta
      const proposalIndex = sections.findIndex((s) => s.includes("PROPUESTA"))
      if (proposalIndex === -1) {
        issues.push("No se encontró la sección 'PROPUESTA'")
        suggestions.push("Añade una sección 'PROPUESTA' después de la exposición de motivos")
      } else {
        // Validar articulado
        const proposalText = sections[proposalIndex]
        if (!proposalText.includes("Artículo")) {
          issues.push("No se encontró articulado en la sección 'PROPUESTA'")
          suggestions.push("Añade artículos (Artículo ÚNICO o Artículo PRIMERO, etc.) en la sección 'PROPUESTA'")
        }
      }

      // Validar lugar, fecha y nombre
      const lastSection = sections[sections.length - 1]
      if (
        !lastSection ||
        !lastSection.includes("México") ||
        !/\d{1,2}\s+de\s+[a-zA-Z]+\s+de\s+\d{4}/.test(lastSection)
      ) {
        issues.push("No se encontró lugar, fecha y nombre del proponente al final del documento")
        suggestions.push(
          "Añade lugar, fecha y nombre del proponente al final del documento (ej: 'Ciudad de México, a 15 de abril de 2024, Dip. Juan Pérez')",
        )
      }

      setValidationResult({
        valid: issues.length === 0,
        issues,
        suggestions,
      })

      setIsValidating(false)
    }, 1500)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Validar Formato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validación de Formato Oficial</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Esta herramienta verifica que tu proyecto de ley cumpla con el formato oficial requerido para iniciativas de
            ley en México.
          </p>

          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-sm text-gray-500">Validando formato...</p>
            </div>
          ) : validationResult ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-md ${validationResult.valid ? "bg-green-50" : "bg-amber-50"}`}>
                <div className="flex items-start">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {validationResult.valid ? "Formato válido" : "Problemas de formato detectados"}
                    </h3>
                    <p className="text-sm mt-1">
                      {validationResult.valid
                        ? "Tu proyecto de ley cumple con el formato oficial requerido."
                        : "Se encontraron los siguientes problemas:"}
                    </p>

                    {!validationResult.valid && (
                      <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
                        {validationResult.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {!validationResult.valid && validationResult.suggestions.length > 0 && (
                <div className="p-4 rounded-md bg-blue-50">
                  <h3 className="font-medium flex items-center">
                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                    Sugerencias
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 mt-2 space-y-1">
                    {validationResult.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={validateFormat} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Iniciar Validación
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
