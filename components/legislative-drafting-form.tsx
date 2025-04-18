"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { generateBill } from "@/app/actions/generate-bill"
import { LoadingSteps } from "@/components/loading-steps"
import { BillPreview } from "@/components/bill-preview"
import { FormatGuide } from "@/components/format-guide"

export function LegislativeDraftingForm() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [billResult, setBillResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    setCurrentStep(1)
    setError(null)
    setBillResult(null)

    try {
      // Simular los pasos del proceso
      const result = await generateBill(prompt)

      // Actualizar los pasos a medida que avanza el proceso
      const steps = [
        { delay: 1000, step: 1 }, // Investigación
        { delay: 3000, step: 2 }, // Borrador base
        { delay: 2000, step: 3 }, // Refinamiento
        { delay: 1000, step: 4 }, // Finalización
      ]

      for (const { delay, step } of steps) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        setCurrentStep(step)
      }

      setBillResult(result)
    } catch (err) {
      console.error("Error generating bill:", err)
      setError("Ocurrió un error al generar el proyecto de ley. Por favor, intente nuevamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <FormatGuide />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Generar Proyecto de Ley</h3>
            <p className="text-sm text-gray-500 mb-4">
              Ingrese un tema o descripción para generar un proyecto de ley relacionado con la regulación de IA. El
              documento seguirá el formato oficial mexicano para iniciativas de ley.
            </p>
            <Input
              placeholder="Ej: IA y deepfake"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mb-2"
            />
            <p className="text-xs text-gray-400">Ejemplo: "genera un proyecto de ley sobre: IA y deepfake"</p>
          </div>
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? "Generando..." : "Generar Proyecto de Ley"}
          </Button>
        </form>
      </Card>

      {isGenerating && <LoadingSteps currentStep={currentStep} />}

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

      {billResult && <BillPreview billContent={billResult} />}
    </div>
  )
}
