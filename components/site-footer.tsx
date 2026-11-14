import Link from "next/link"
import { Brand } from "@/components/site-header"

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-sm text-sm text-muted-foreground">
            Herramienta de apoyo a la redacción legislativa. Los textos generados son borradores y requieren revisión
            jurídica profesional antes de cualquier uso oficial.
          </p>
        </div>
        <nav aria-label="Pie de página" className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Navegación</p>
          <Link href="/" className="block text-muted-foreground hover:text-foreground">
            Redactar un proyecto
          </Link>
          <Link href="/bills" className="block text-muted-foreground hover:text-foreground">
            Mis borradores
          </Link>
          <Link href="/example" className="block text-muted-foreground hover:text-foreground">
            Ver un ejemplo
          </Link>
        </nav>
        <div className="space-y-2 text-sm">
          <p className="eyebrow mb-3">Proyecto</p>
          <Link href="/about" className="block text-muted-foreground hover:text-foreground">
            Cómo está construido
          </Link>
          <a
            href="https://github.com/DanieelRC/LegislaBot"
            target="_blank"
            rel="noreferrer"
            className="block text-muted-foreground hover:text-foreground"
          >
            Código en GitHub
          </a>
          <a
            href="mailto:drodriguezc1905@alumno.ipn.mx"
            className="block text-muted-foreground hover:text-foreground"
          >
            Contacto
          </a>
        </div>
      </div>
      <div className="border-t">
        <p className="container py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LegislaBot · Hecho con Next.js, AI SDK y Neon
        </p>
      </div>
    </footer>
  )
}
