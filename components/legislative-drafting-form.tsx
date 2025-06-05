"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// Import the new server action
import { processGenerationStep } from "@/app/actions/generate-bill"
import { LoadingSteps } from "@/components/loading-steps"
import { BillPreview } from "@/components/bill-preview"
import { FormatGuide } from "@/components/format-guide"

export function LegislativeDraftingForm() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [billResult, setBillResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // State for intermediate results
  const [researchContext, setResearchContext] = useState<string | null>(null)
  const [initialDraft, setInitialDraft] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setBillResult(null)
    setResearchContext(null)
    setInitialDraft(null)
    setCurrentStep(0) // Reset step display

    try {
      // Step 1: Investigación previa
      setCurrentStep(1)
      const researchData = await processGenerationStep({
        stage: 'research',
        topic: prompt,
      })
      setResearchContext(researchData)

      // Step 2: Borrador base
      setCurrentStep(2)
      if (!researchData) throw new Error("Contexto de investigación no obtenido.");
      const draftData = await processGenerationStep({
        stage: 'draft',
        topic: prompt,
        inputData: researchData,
      })
      setInitialDraft(draftData)

      // Step 3: Refinamiento Legal
      setCurrentStep(3)
      if (!draftData) throw new Error("Borrador inicial no obtenido.");
      const finalBillData = await processGenerationStep({
        stage: 'refine',
        topic: prompt,
        inputData: draftData,
      })

      // Step 4: Finalización
      setCurrentStep(4)
      setBillResult(finalBillData)

    } catch (err) {
      console.error("Error generating bill:", err)
      setError(
        err instanceof Error ? err.message : "Ocurrió un error al generar el proyecto de ley. Por favor, intente nuevamente."
      )
      setCurrentStep(0) // Reset step display on error
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

      {/* Show loading steps if isGenerating OR if billResult is present (to show completed steps) 
          Adjust this logic if you want LoadingSteps to disappear immediately after generation.
          Current logic in LoadingSteps handles showing checkmarks for completed steps.
          We only want to show LoadingSteps when actively generating.
      */}
      {isGenerating && <LoadingSteps currentStep={currentStep} />}

      {/* If generation is complete and successful, currentStep would be 4. 
          LoadingSteps would show all checkmarks.
          If you want to hide LoadingSteps after completion, you might need to adjust
          when setIsGenerating(false) is called or the condition for rendering LoadingSteps.
          For now, it will show all steps completed if currentStep is 4 and isGenerating becomes false.
          Let's keep it simple: only show LoadingSteps when isGenerating is true.
      */}

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">{error}</div>}

      {billResult && !isGenerating && <BillPreview billContent={billResult} />}
    </div>
  )
}
