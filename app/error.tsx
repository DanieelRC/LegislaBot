"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Error en la aplicación:", error)
  }, [error])

  return (
    <div className="container max-w-xl py-24 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="mt-3 text-4xl font-semibold">Algo no salió bien</h1>
      <p className="mt-4 text-muted-foreground">
        Ocurrió un problema al cargar esta página. Puedes intentarlo de nuevo; si persiste, vuelve más tarde.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Referencia: {error.digest}</p>}
      <Button onClick={reset} className="mt-8">
        Intentar de nuevo
      </Button>
    </div>
  )
}
