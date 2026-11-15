import type { Metadata } from "next"

export const metadata: Metadata = { title: "Acerca de" }

const pipeline = [
  ["Investigación", "grok-build-0.1", "Marco legal, referentes y vacíos"],
  ["Estructura", "grok-build-0.1", "Título y esquema con numeración"],
  ["Exposición de motivos", "grok-build-0.1", "Considerandos fácticos y normativos"],
  ["Articulado", "grok-build-0.1 × Título", "Una petición por cada Título"],
  ["Transitorios y referencias", "grok-build-0.1", "Cierre, firma y fuentes"],
]

const decisions = [
  {
    title: "Generación por secciones, en streaming",
    body: "Una ley completa tarda varios minutos en escribirse y el plan gratuito de Vercel corta las peticiones largas. En lugar de una llamada monolítica, el cliente orquesta peticiones cortas —una por sección— a una ruta Edge que transmite el texto conforme el modelo lo produce. Ninguna petición se acerca al límite, se puede detener y reanudar, y un fallo solo repite ese paso.",
  },
  {
    title: "Cuota por generación con tokens firmados",
    body: "El primer paso consume la cuota diaria por IP (contador atómico en Postgres) y emite un token HMAC con expiración. Los pasos siguientes deben presentarlo y tienen su propio tope, así que no es posible saltarse el límite llamando directo a pasos posteriores. Agotada la cuota, la app pasa a un modo demo que recorre el mismo flujo con contenido fijo.",
  },
  {
    title: "Borradores privados sin cuentas",
    body: "Cada navegador recibe un identificador aleatorio en una cookie httpOnly. Los borradores se guardan ligados a él y todas las consultas filtran por ese dueño en el servidor: nadie puede listar ni borrar lo de otra persona, y no hay fricción de registro para quien solo quiere probar.",
  },
  {
    title: "Un solo parser para todo",
    body: "El texto legal se interpreta una vez (títulos, capítulos, artículos, fracciones, firma) y esa estructura alimenta la vista tipográfica, el índice, el validador de formato y las exportaciones a PDF y Word, de modo que siempre coinciden.",
  },
]

const security = [
  "Entradas validadas con Zod en el servidor; el tema del usuario se delimita en el prompt como dato, no como instrucción.",
  "Secretos solo en variables de entorno; la página de ajustes usa una lista blanca de claves y exige un token de administración.",
  "Cabeceras CSP, HSTS, X-Frame-Options y Referrer-Policy en todas las respuestas.",
  "Errores genéricos hacia el cliente; el detalle queda en los registros del servidor.",
]

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-12">
      <p className="eyebrow">Caso de estudio</p>
      <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Cómo está construido LegislaBot</h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Un asistente que convierte un tema en una iniciativa de ley con formato oficial para la Ciudad de México. Nació
        como proyecto académico en el IPN y se rediseñó con foco en tres cosas: que el proceso sea visible, que el
        resultado sea utilizable y que el servicio sea seguro de exponer públicamente.
      </p>

      <section aria-labelledby="flujo" className="mt-14">
        <h2 id="flujo" className="text-2xl font-semibold">
          El flujo
        </h2>
        <ol className="mt-6 divide-y border-y">
          {pipeline.map(([step, model, detail], i) => (
            <li key={step} className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-4 sm:grid-cols-[2.5rem_1fr_10rem]">
              <span className="font-serif text-xl italic text-gold" aria-hidden>
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{step}</p>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
              <p className="col-start-2 mt-1 font-mono text-xs text-muted-foreground sm:col-start-3 sm:mt-0 sm:text-right">
                {model}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="decisiones" className="mt-14">
        <h2 id="decisiones" className="text-2xl font-semibold">
          Decisiones de diseño
        </h2>
        <div className="mt-6 space-y-8">
          {decisions.map((d) => (
            <article key={d.title}>
              <h3 className="text-lg font-semibold">{d.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{d.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="seguridad" className="mt-14">
        <h2 id="seguridad" className="text-2xl font-semibold">
          Seguridad
        </h2>
        <ul className="mt-6 space-y-3">
          {security.map((item) => (
            <li key={item} className="border-l-2 border-gold/60 pl-4 text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="stack" className="mt-14">
        <h2 id="stack" className="text-2xl font-semibold">
          Stack
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Next.js 14 (App Router, Edge Runtime) · TypeScript · Vercel AI SDK con Grok (xAI) · Postgres en Neon con
          Drizzle ORM · Tailwind CSS y Radix UI · Zod · jsPDF.
        </p>
      </section>

      <p className="mt-14 border-t pt-6 text-sm text-muted-foreground">
        LegislaBot produce borradores de apoyo. No sustituye la revisión jurídica profesional ni constituye asesoría
        legal; toda cita normativa debe verificarse contra su fuente oficial.
      </p>
    </div>
  )
}
