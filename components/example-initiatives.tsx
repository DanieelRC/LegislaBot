"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const examples = [
  {
    id: "example1",
    title: "LEY PARA LA REGULACIÓN DE SISTEMAS DE INTELIGENCIA ARTIFICIAL EN LA CIUDAD DE MÉXICO",
    description:
      "Establece un marco regulatorio para el desarrollo, implementación y uso de sistemas de IA en la CDMX.",
    content: `LEY PARA LA REGULACIÓN DE SISTEMAS DE INTELIGENCIA ARTIFICIAL EN LA CIUDAD DE MÉXICO

EXPOSICIÓN DE MOTIVOS

La inteligencia artificial (IA) representa una de las transformaciones tecnológicas más significativas de nuestra era, con el potencial de revolucionar diversos sectores económicos, sociales y gubernamentales. La Ciudad de México, como centro de innovación y desarrollo tecnológico del país, enfrenta el desafío de aprovechar los beneficios de estas tecnologías mientras garantiza que su implementación sea ética, segura y respetuosa de los derechos fundamentales de sus habitantes.

Actualmente, la ausencia de un marco regulatorio específico para sistemas de inteligencia artificial genera incertidumbre jurídica tanto para desarrolladores como para usuarios, lo que puede resultar en implementaciones que no consideren adecuadamente aspectos como la privacidad, la transparencia, la rendición de cuentas y la no discriminación.

Esta iniciativa busca establecer principios claros y mecanismos de gobernanza que promuevan la innovación responsable en el campo de la inteligencia artificial, garantizando que estas tecnologías contribuyan al bienestar social, el desarrollo económico sostenible y el fortalecimiento de los servicios públicos en la Ciudad de México.

La presente ley se fundamenta en estándares internacionales como los Principios de la OCDE sobre Inteligencia Artificial, las recomendaciones de la UNESCO sobre la Ética de la Inteligencia Artificial y las mejores prácticas implementadas en otras jurisdicciones, adaptándolas al contexto específico de la Ciudad de México y su marco jurídico.

PROPUESTA

ARTÍCULO PRIMERO. Se expide la Ley para la Regulación de Sistemas de Inteligencia Artificial en la Ciudad de México, para quedar como sigue:

TÍTULO PRIMERO
DISPOSICIONES GENERALES

Artículo 1. La presente Ley es de orden público e interés social y tiene por objeto establecer los principios, bases, procedimientos e instituciones para la regulación, desarrollo, implementación y uso de sistemas de inteligencia artificial en la Ciudad de México.

Artículo 2. Para los efectos de esta Ley se entenderá por:
I. Inteligencia Artificial: Conjunto de técnicas y sistemas computacionales diseñados para realizar tareas que normalmente requieren inteligencia humana, como el aprendizaje, la toma de decisiones, el reconocimiento de patrones y el procesamiento del lenguaje natural.
II. Sistema de Alto Riesgo: Aquellos sistemas de inteligencia artificial cuyo uso pueda afectar significativamente derechos fundamentales, la seguridad o el bienestar de las personas.
III. Evaluación de Impacto Algorítmico: Proceso sistemático para identificar, evaluar y mitigar los posibles efectos negativos de un sistema de inteligencia artificial antes de su implementación.

[...]

Ciudad de México, a 15 de abril de 2024, Dip. María Rodríguez González.`,
  },
  {
    id: "example2",
    title: "INICIATIVA CON PROYECTO DE DECRETO QUE REGULA EL USO DE DEEPFAKES EN LA CIUDAD DE MÉXICO",
    description: "Establece medidas para prevenir y sancionar el uso malicioso de deepfakes.",
    content: `INICIATIVA CON PROYECTO DE DECRETO QUE REGULA EL USO DE DEEPFAKES EN LA CIUDAD DE MÉXICO

EXPOSICIÓN DE MOTIVOS

El avance tecnológico en materia de inteligencia artificial ha permitido el desarrollo de herramientas capaces de crear contenido sintético altamente realista, conocido comúnmente como "deepfakes". Estas tecnologías permiten manipular o generar imágenes, videos y audios que pueden resultar indistinguibles de contenido auténtico para el ojo o el oído humano.

Si bien estas tecnologías tienen aplicaciones legítimas en campos como el entretenimiento, la educación y las artes, también presentan riesgos significativos cuando son utilizadas con fines maliciosos, como la desinformación, el fraude, la suplantación de identidad, el acoso o la creación de contenido íntimo no consentido.

La Ciudad de México, como centro urbano con alta penetración tecnológica, requiere un marco normativo que aborde específicamente los desafíos que plantean los deepfakes, estableciendo medidas preventivas, obligaciones para los desarrolladores y plataformas, así como sanciones para quienes hagan uso indebido de estas tecnologías en perjuicio de terceros.

Esta iniciativa busca equilibrar la protección de derechos fundamentales como la privacidad, la dignidad, el honor y la propia imagen, con el fomento a la innovación tecnológica y la libertad de expresión, estableciendo reglas claras que brinden certeza jurídica a todos los actores involucrados.

PROPUESTA

Artículo ÚNICO. Se expide el Decreto que Regula el Uso de Deepfakes en la Ciudad de México, para quedar como sigue:

DECRETO QUE REGULA EL USO DE DEEPFAKES EN LA CIUDAD DE MÉXICO

CAPÍTULO I
DISPOSICIONES GENERALES

Artículo 1. El presente Decreto es de orden público e interés social, y tiene por objeto regular la creación, distribución y uso de contenido sintético generado mediante técnicas de inteligencia artificial, conocido como "deepfakes", en la Ciudad de México.

Artículo 2. Para efectos de este Decreto, se entenderá por:
I. Deepfake: Contenido sintético generado o manipulado mediante técnicas de inteligencia artificial que representa de manera realista a personas diciendo o haciendo cosas que nunca dijeron o hicieron.
II. Contenido sintético: Imágenes, videos, audios u otros formatos multimedia creados o alterados sustancialmente mediante algoritmos de inteligencia artificial.
III. Etiquetado: Identificación visible que indica que el contenido ha sido generado o manipulado mediante inteligencia artificial.

[...]

Ciudad de México, a 20 de abril de 2024, Dip. Carlos Martínez López.`,
  },
  {
    id: "example3",
    title: "INICIATIVA DE LEY DE TRANSPARENCIA ALGORÍTMICA PARA LA CIUDAD DE MÉXICO",
    description: "Establece requisitos de transparencia para sistemas algorítmicos utilizados en servicios públicos.",
    content: `INICIATIVA DE LEY DE TRANSPARENCIA ALGORÍTMICA PARA LA CIUDAD DE MÉXICO

EXPOSICIÓN DE MOTIVOS

En la era digital, los algoritmos y sistemas de inteligencia artificial están transformando la forma en que se toman decisiones en diversos ámbitos, incluyendo la prestación de servicios públicos, la asignación de recursos, la evaluación de riesgos y la implementación de políticas públicas. Estos sistemas ofrecen oportunidades para mejorar la eficiencia, precisión y escala de las operaciones gubernamentales.

Sin embargo, la creciente dependencia de sistemas algorítmicos plantea desafíos significativos en términos de transparencia, rendición de cuentas y equidad. La opacidad en el funcionamiento de estos sistemas puede conducir a decisiones discriminatorias, injustas o arbitrarias que afecten los derechos de las personas sin que existan mecanismos adecuados para cuestionar o revisar dichas decisiones.

La Ciudad de México, como entidad comprometida con la innovación, la transparencia y los derechos humanos, requiere un marco normativo que establezca estándares claros para el uso de sistemas algorítmicos en el sector público, garantizando que estos sistemas sean transparentes, auditables y respetuosos de los derechos fundamentales de todos los habitantes.

Esta iniciativa busca establecer obligaciones de transparencia algorítmica para las entidades públicas de la Ciudad de México, promoviendo la rendición de cuentas, la participación ciudadana y la confianza en los sistemas tecnológicos utilizados por el gobierno.

PROPUESTA

Artículo ÚNICO. Se expide la Ley de Transparencia Algorítmica para la Ciudad de México, para quedar como sigue:

LEY DE TRANSPARENCIA ALGORÍTMICA PARA LA CIUDAD DE MÉXICO

TÍTULO PRIMERO
DISPOSICIONES GENERALES

Artículo 1. La presente Ley es de orden público, interés social y observancia general en la Ciudad de México, y tiene por objeto garantizar la transparencia, explicabilidad y rendición de cuentas en el diseño, desarrollo, adquisición, implementación y uso de sistemas algorítmicos por parte de los entes públicos de la Ciudad de México.

Artículo 2. Para los efectos de esta Ley se entenderá por:
I. Sistema Algorítmico: Cualquier sistema computacional que utilice algoritmos, incluyendo aquellos basados en inteligencia artificial o aprendizaje automático, para realizar tareas, procesar información o tomar decisiones.
II. Registro Público de Sistemas Algorítmicos: Base de datos pública que contiene información sobre los sistemas algorítmicos utilizados por los entes públicos de la Ciudad de México.
III. Evaluación de Impacto Algorítmico: Proceso sistemático para identificar, evaluar y mitigar los posibles efectos de un sistema algorítmico en los derechos de las personas y en el interés público.

[...]

Ciudad de México, a 25 de abril de 2024, Dip. Ana García Hernández.`,
  },
]

export function ExampleInitiatives() {
  const [activeTab, setActiveTab] = useState("example1")
  const [copied, setCopied] = useState<string | null>(null)
  const { toast } = useToast()

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    toast({
      title: "Contenido copiado",
      description: "El ejemplo ha sido copiado al portapapeles.",
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const handleUseExample = (title: string) => {
    toast({
      title: "Ejemplo seleccionado",
      description: `Has seleccionado "${title}" como base para tu proyecto de ley.`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-emerald-600" />
          Ejemplos de Iniciativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            {examples.map((example) => (
              <TabsTrigger key={example.id} value={example.id} className="text-xs">
                Ejemplo {examples.findIndex((e) => e.id === example.id) + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {examples.map((example) => (
            <TabsContent key={example.id} value={example.id}>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{example.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                </div>

                <div className="border rounded-md p-4 bg-gray-50 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap text-black">{example.content}</pre>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(example.id, example.content)}
                    className="flex items-center"
                  >
                    {copied === example.id ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied === example.id ? "Copiado" : "Copiar"}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleUseExample(example.title)}
                  >
                    Usar como base
                  </Button>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
