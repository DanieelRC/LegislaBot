"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Info, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EnvWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [dbStatus, setDbStatus] = useState<"checking" | "connected" | "error">("checking")

  useEffect(() => {
    // Esta función se ejecuta solo en el cliente
    // Verificamos si las variables de entorno están configuradas
    const checkEnvVars = async () => {
      try {
        const response = await fetch("/api/health")

        if (!response.ok) {
          console.warn("Health check failed with status:", response.status)
          setDbStatus("error")
          setShowWarning(true)
          setMissingVars(["Error de conexión al servidor"])
          return
        }

        const data = await response.json()

        if (data.services) {
          const missingServices = []
          if (data.services.openai === "not configured") missingServices.push("OpenAI API Key")
          if (data.services.google === "not configured") missingServices.push("Google API Key")
          if (data.services.database === "disconnected") {
            missingServices.push("Conexión a base de datos")
            setDbStatus("error")
          } else {
            setDbStatus("connected")
          }

          setMissingVars(missingServices)
          setShowWarning(missingServices.length > 0)
        }
      } catch (error) {
        console.error("Error checking environment variables:", error)
        setDbStatus("error")
        setShowWarning(true)
        setMissingVars(["Error de conexión al servidor"])
      }
    }

    checkEnvVars()
  }, [])

  if (!showWarning && !showInfo && dbStatus === "connected") return null

  return (
    <>
      {dbStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <Database className="h-4 w-4" />
          <AlertTitle>Problema de conexión a la base de datos</AlertTitle>
          <AlertDescription>
            <p>No se pudo establecer conexión con la base de datos. La aplicación funcionará en modo limitado.</p>
            <p className="mt-2 text-sm">
              Las funciones de guardado y carga de proyectos no estarán disponibles hasta que se resuelva este problema.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* {showInfo && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Modo de demostración activo</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p>
              La aplicación está funcionando en modo de demostración con un modelo de IA simulado localmente. No se
              requieren claves de API para esta demostración.
            </p>
            <button onClick={() => setShowInfo(false)} className="text-sm text-blue-700 hover:underline mt-2">
              Entendido, no mostrar de nuevo
            </button>
          </AlertDescription>
        </Alert>
      )} */}

      {showWarning && missingVars.length > 0 && missingVars[0] !== "Conexión a base de datos" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Configuración incompleta</AlertTitle>
          <AlertDescription>
            <p>Faltan configurar las siguientes variables de entorno:</p>
            <ul className="list-disc pl-5 mt-2 text-sm">
              {missingVars.map((variable, index) => (
                <li key={index}>{variable}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              La aplicación está funcionando en modo de demostración con funcionalidad limitada.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
