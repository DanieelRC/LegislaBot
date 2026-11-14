import type { Metadata } from "next"
import { BillWorkspace } from "@/components/bill-workspace"
import { composeBill, parseOutline } from "@/lib/bill-parser"
import { DEMO_CLOSING, DEMO_EXPOSITION, DEMO_OUTLINE, DEMO_RESEARCH, DEMO_TITLES } from "@/lib/demo-content"

export const metadata: Metadata = { title: "Ejemplo" }

export default function ExamplePage() {
  const content = composeBill({
    lawTitle: parseOutline(DEMO_OUTLINE).lawTitle,
    exposition: DEMO_EXPOSITION,
    titles: DEMO_TITLES,
    closing: DEMO_CLOSING("15 de abril de 2025", "[Nombre de la persona legisladora proponente]"),
  })

  return (
    <div className="container space-y-8 py-12">
      <div className="max-w-2xl">
        <p className="eyebrow">Ejemplo</p>
        <h1 className="mt-2 text-4xl font-semibold">Así se ve un proyecto terminado</h1>
        <p className="mt-3 text-muted-foreground">
          Una iniciativa de muestra, abreviada, con la misma estructura que produce el generador. Puedes recorrer el
          índice, editarla o exportarla.
        </p>
      </div>
      <BillWorkspace initialContent={content} research={DEMO_RESEARCH} />
    </div>
  )
}
