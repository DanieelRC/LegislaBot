"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface HealthStatus {
  status: "ok" | "degraded" | "error"
  services: {
    database: "connected" | "disconnected"
    openai: "configured" | "not configured"
    google: "configured" | "not configured"
  }
}

export function DbStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setHealth(data)
      } catch (error) {
        console.error("Error checking health:", error)
        setHealth({
          status: "error",
          services: {
            database: "disconnected",
            openai: "not configured",
            google: "not configured",
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkHealth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center text-xs text-gray-500">
        <div className="animate-spin h-3 w-3 border-b border-gray-500 rounded-full mr-1"></div>
        Verificando conexión...
      </div>
    )
  }

  if (!health) {
    return null
  }

  return (
    <div className="flex items-center text-xs">
      {health.services.database === "connected" ? (
        <div className="flex items-center text-emerald-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>BD conectada</span>
        </div>
      ) : (
        <div className="flex items-center text-red-500">
          <XCircle className="h-3 w-3 mr-1" />
          <span>Error de BD</span>
        </div>
      )}

      {(health.services.openai === "not configured" || health.services.google === "not configured") && (
        <div className="flex items-center text-amber-500 ml-3">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span>API no configurada</span>
        </div>
      )}
    </div>
  )
}
