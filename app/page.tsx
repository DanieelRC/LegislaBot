import { Generator } from "@/components/generator"

const steps = [
  {
    n: "I",
    title: "Investiga",
    body: "Reúne legislación vigente, iniciativas previas y referentes internacionales sobre el tema, y detecta los vacíos legales.",
  },
  {
    n: "II",
    title: "Estructura",
    body: "Propone el título formal de la ley y su esquema de Títulos y Capítulos, con la numeración de artículos ya asignada.",
  },
  {
    n: "III",
    title: "Redacta",
    body: "Escribe la exposición de motivos, cada Título del articulado y los transitorios, una sección a la vez y a la vista.",
  },
]

export default function Home() {
  return (
    <>
      <Generator />

      <section aria-labelledby="como-funciona" className="container max-w-4xl py-14">
        <div className="rule-double mb-10 w-16" aria-hidden />
        <h2 id="como-funciona" className="text-3xl font-semibold">
          Un proceso legislativo, no una caja negra
        </h2>
        <ol className="mt-10 grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <span className="font-serif text-3xl italic text-gold" aria-hidden>
                {step.n}
              </span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <dl className="mt-14 grid gap-6 border-t pt-8 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold">Formato oficial</dt>
            <dd className="mt-1 text-muted-foreground">
              Estructura de iniciativa mexicana, validación automática y exportación a PDF carta o Word.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Sin esperas a ciegas</dt>
            <dd className="mt-1 text-muted-foreground">
              El texto llega en streaming; puedes detener la redacción y retomarla sin perder lo avanzado.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Borradores privados</dt>
            <dd className="mt-1 text-muted-foreground">
              No requiere cuenta. Lo que guardas queda ligado a tu navegador y nadie más puede verlo.
            </dd>
          </div>
        </dl>
      </section>
    </>
  )
}
