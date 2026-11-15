import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container max-w-xl py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold">Esta página no existe</h1>
      <p className="mt-4 text-muted-foreground">
        El enlace puede estar incompleto, o el borrador pertenece a otro navegador o fue eliminado.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
