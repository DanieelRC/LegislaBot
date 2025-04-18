import { GavelIcon } from "lucide-react"
import { DbStatus } from "./db-status"

export function LegislativeHeader() {
  return (
    <header className="flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center mb-4">
        <GavelIcon className="h-10 w-10 text-emerald-600 mr-2" />
        <h1 className="text-3xl font-bold text-emerald-700">LegislaBot</h1>
      </div>
      <h2 className="text-xl font-semibold text-gray-700">Asistente de Formulación de Proyectos de Ley</h2>
      <p className="mt-2 text-gray-600 max-w-2xl">
        Plataforma de apoyo a legisladores para la formulación de Proyectos de Ley relacionados con la regulación del
        uso de la inteligencia artificial en la Ciudad de México (2024-2030).
      </p>
      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-md max-w-2xl">
        <div className="flex justify-between items-center">
          <p className="text-sm text-emerald-700">
            <strong>Formato oficial:</strong> Todas las propuestas generadas siguen el formato oficial mexicano para
            iniciativas de ley, incluyendo título, exposición de motivos, propuesta y datos del proponente.
          </p>
          <DbStatus />
        </div>
      </div>
    </header>
  )
}
