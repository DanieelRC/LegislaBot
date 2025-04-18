import { Info } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FormatGuide() {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Info className="h-5 w-5 text-emerald-600" />
        <h3 className="font-medium">Guía de Formato Oficial</h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="structure">
          <AccordionTrigger>Estructura de la Iniciativa</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>
                <strong>Título de la iniciativa:</strong> Nombre descriptivo del proyecto de ley.
              </li>
              <li>
                <strong>Exposición de Motivos:</strong> Argumentos jurídicos y técnicos que fundamentan la propuesta.
                Explica el problema, la solución propuesta y los beneficios esperados.
              </li>
              <li>
                <strong>Texto del cuerpo normativo:</strong> La propuesta legal concreta, organizada en artículos. Puede
                usar "Artículo ÚNICO" o "Artículo PRIMERO, SEGUNDO..." según corresponda.
              </li>
              <li>
                <strong>Lugar, fecha y nombre del proponente:</strong> Datos de quien presenta la iniciativa.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="format">
          <AccordionTrigger>Formalidades del Documento</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>Interlineado a 1.5</li>
              <li>Tamaño carta</li>
              <li>Letra Arial de 12 puntos</li>
              <li>Doble espacio entre cada párrafo</li>
              <li>Páginas numeradas</li>
              <li>Formato PDF para la versión final</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="types">
          <AccordionTrigger>Tipos de Iniciativas</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
              <li>
                <strong>Crear:</strong> Proponer una nueva ley, código o artículo.
              </li>
              <li>
                <strong>Abrogar:</strong> Dejar sin vigencia un ordenamiento jurídico en su totalidad.
              </li>
              <li>
                <strong>Reformar:</strong> Puede implicar:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    <strong>Derogar:</strong> Eliminar parcialmente partes de un ordenamiento.
                  </li>
                  <li>
                    <strong>Adicionar:</strong> Añadir elementos a un ordenamiento existente.
                  </li>
                  <li>
                    <strong>Modificar:</strong> Cambiar algo ya establecido en una ley o código.
                  </li>
                </ul>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
