"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis o consola
    console.error("Error en la aplicación:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">Ha ocurrido un error</h2>
        <p className="text-gray-600 mb-4">
          Lo sentimos, ha ocurrido un error al cargar la aplicación. Nuestro equipo ha sido notificado.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            Código de referencia: <code className="bg-gray-100 px-1 py-0.5 rounded">{error.digest}</code>
          </p>
        )}
        <Button onClick={reset} className="bg-emerald-600 hover:bg-emerald-700">
          Intentar nuevamente
        </Button>
      </div>
    </div>
  )
}
