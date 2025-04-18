"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function DbFallback() {
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()

      if (data.services && data.services.database === "connected") {
        toast({
          title: "Conexión establecida",
          description: "La conexión a la base de datos ha sido restablecida.",
        })
        // Recargar la página para aplicar los cambios
        window.location.reload()
      } else {
        toast({
          title: "Conexión fallida",
          description: "No se pudo establecer conexión con la base de datos.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo verificar la conexión con el servidor.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2 text-red-600" />
          Problema de Conexión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-md text-red-800 text-sm">
          <p>No se pudo establecer conexión con la base de datos. Esto puede deberse a:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>La base de datos no está disponible temporalmente</li>
            <li>La URL de conexión no es correcta</li>
            <li>Hay un problema de red</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600">
          Puedes intentar verificar la conexión nuevamente o continuar en modo de demostración con funcionalidad
          limitada.
        </p>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
          <Button onClick={checkConnection} disabled={isChecking} className="bg-emerald-600 hover:bg-emerald-700">
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar conexión"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
