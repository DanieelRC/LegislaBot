import { CheckCircle, Circle, Loader2 } from "lucide-react"

interface LoadingStepsProps {
  currentStep: number
}

export function LoadingSteps({ currentStep }: LoadingStepsProps) {
  const steps = [
    { id: 1, name: "Investigación previa", description: "Recuperando artículos y marcos legales relevantes" },
    { id: 2, name: "Borrador base", description: "Generando estructura inicial del proyecto de ley" },
    { id: 3, name: "Refinamiento Legal", description: "Validando entidades y puliendo estilo jurídico" },
    { id: 4, name: "Finalización", description: "Preparando documento final" },
  ]

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="font-medium text-lg">Generando Proyecto de Ley</h3>
      <div className="space-y-3">
        {steps.map((step) => {
          let Icon
          let textColor

          if (step.id < currentStep) {
            Icon = CheckCircle
            textColor = "text-emerald-600"
          } else if (step.id === currentStep) {
            Icon = Loader2
            textColor = "text-blue-600"
          } else {
            Icon = Circle
            textColor = "text-gray-400"
          }

          return (
            <div key={step.id} className="flex items-start">
              <div className={`flex-shrink-0 ${textColor}`}>
                <Icon className={`h-5 w-5 ${step.id === currentStep ? "animate-spin" : ""}`} />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${textColor}`}>{step.name}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
