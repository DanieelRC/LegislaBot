"use client"

import { useEffect, useState } from "react"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [editable, setEditable] = useState(false)
  const [legislator, setLegislator] = useState("")
  const [tracking, setTracking] = useState(true)
  const [adminToken, setAdminToken] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: { settings: Record<string, string>; editable: boolean }) => {
        setLegislator(data.settings.default_legislator ?? "")
        setTracking(data.settings.enable_api_usage_tracking !== "false")
        setEditable(data.editable)
      })
      .catch(() => toast({ title: "No se pudieron cargar los ajustes", variant: "destructive" }))
      .finally(() => setLoading(false))
  }, [toast])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-token": adminToken },
        body: JSON.stringify({ default_legislator: legislator, enable_api_usage_tracking: String(tracking) }),
      })
      if (response.status === 401) {
        toast({ title: "Token incorrecto", description: "Verifica el token de administración.", variant: "destructive" })
      } else if (!response.ok) {
        toast({ title: "No se pudo guardar", description: "Revisa la conexión a la base de datos.", variant: "destructive" })
      } else {
        toast({ title: "Ajustes guardados" })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <p className="eyebrow">Administración</p>
      <h1 className="mt-2 text-4xl font-semibold">Ajustes</h1>
      <p className="mt-3 text-muted-foreground">
        Valores que se aplican a todos los proyectos generados. Las claves de IA y la conexión a la base de datos se
        configuran únicamente como variables de entorno del servidor; nunca desde esta página.
      </p>

      <form onSubmit={save} className="mt-10 space-y-8" aria-busy={loading}>
        <fieldset disabled={loading} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="legislator">Proponente por defecto</Label>
            <Input
              id="legislator"
              value={legislator}
              onChange={(e) => setLegislator(e.target.value)}
              maxLength={120}
              placeholder="Dip. Nombre Apellido"
            />
            <p className="text-xs text-muted-foreground">Aparece en la firma, después del lugar y la fecha.</p>
          </div>

          <div className="flex items-start justify-between gap-6">
            <div>
              <Label htmlFor="tracking">Registrar consumo de tokens</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Guarda cuántos tokens usa cada paso de la generación, sin contenido ni datos personales.
              </p>
            </div>
            <Switch id="tracking" checked={tracking} onCheckedChange={setTracking} />
          </div>

          <div className="space-y-2 border-t pt-8">
            <Label htmlFor="admin-token" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Token de administración
            </Label>
            <Input
              id="admin-token"
              type="password"
              autoComplete="off"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              disabled={!editable}
            />
            <p className="text-xs text-muted-foreground">
              {editable
                ? "Necesario para guardar cambios. Se envía solo con esta solicitud y no se almacena."
                : "La edición está deshabilitada: el servidor no tiene configurada la variable ADMIN_TOKEN."}
            </p>
          </div>

          <Button type="submit" disabled={!editable || !adminToken || saving}>
            {saving && <Loader2 className="animate-spin" />} Guardar ajustes
          </Button>
        </fieldset>
      </form>
    </div>
  )
}
