/**
 * Este módulo proporciona una implementación simulada de generación de texto
 * para usar cuando no se dispone de API keys de servicios de IA.
 */

import { readFileSync } from "fs"
import path from "path"

// Simulación de estructura de respuesta de la API
interface MockAIResponse {
  text: string
  usage?: {
    input_tokens: number
    output_tokens: number
  }
}

// Plantillas para diferentes tipos de contenido
const templates = {
  research: `
# Investigación sobre regulación de IA en México

## Marco Legal Actual
- **Constitución Política de los Estados Unidos Mexicanos**: No contiene disposiciones específicas sobre IA, pero establece derechos fundamentales aplicables.
- **Ley Federal de Protección de Datos Personales en Posesión de Particulares**: Regula el tratamiento de datos personales, relevante para sistemas de IA.
- **Estrategia de IA MX 2018**: Documento no vinculante que establece principios para el desarrollo de la IA en México.

## Precedentes Internacionales Relevantes
- **Reglamento General de Protección de Datos (GDPR)** de la Unión Europea: Establece el derecho a no ser objeto de decisiones basadas únicamente en el tratamiento automatizado.
- **Ley de IA de la Unión Europea**: Primer marco regulatorio integral sobre IA, clasificando sistemas por niveles de riesgo.
- **Orden Ejecutiva sobre IA de EE.UU.**: Establece principios para el desarrollo seguro y responsable de la IA.

## Artículos Académicos
1. "Regulación de la Inteligencia Artificial en México: Retos y Oportunidades" - Revista Mexicana de Derecho Informático (2023)
2. "Implicaciones Éticas y Jurídicas de la IA en la Ciudad de México" - Instituto de Investigaciones Jurídicas, UNAM (2022)
3. "Hacia un Marco Regulatorio para la IA en América Latina" - CEPAL (2023)

## Iniciativas Locales
- Propuesta de Ley de Innovación Digital para la CDMX (2022) - Incluye capítulo sobre IA pero no fue aprobada.
- Foro "IA para el Bien Público" organizado por el Gobierno de la CDMX (2023).
  `,

  draft: `
LEY PARA LA REGULACIÓN DE SISTEMAS DE INTELIGENCIA ARTIFICIAL EN LA CIUDAD DE MÉXICO

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

Ciudad de México, a 15 de abril de 2024, Dip. María Rodríguez González.
  `,

  refinement: `
LEY PARA LA REGULACIÓN DE SISTEMAS DE INTELIGENCIA ARTIFICIAL EN LA CIUDAD DE MÉXICO

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
IV. Transparencia Algorítmica: Principio que implica la divulgación de información suficiente sobre el funcionamiento de un sistema de inteligencia artificial para permitir su comprensión, supervisión y rendición de cuentas.
V. Explicabilidad: Capacidad de un sistema de inteligencia artificial para proporcionar explicaciones comprensibles sobre sus decisiones o recomendaciones.

TÍTULO SEGUNDO
DE LOS PRINCIPIOS Y DERECHOS

Artículo 3. El desarrollo, implementación y uso de sistemas de inteligencia artificial en la Ciudad de México se regirá por los siguientes principios:
I. Respeto a los derechos humanos
II. Transparencia y explicabilidad
III. Responsabilidad y rendición de cuentas
IV. No discriminación e inclusión
V. Privacidad y protección de datos personales
VI. Seguridad y robustez técnica
VII. Supervisión humana efectiva
VIII. Beneficio social y sostenibilidad ambiental

Ciudad de México, a 15 de abril de 2024, Dip. María Rodríguez González.
  `,
}

// Función para generar texto simulado basado en el tipo de contenido
export async function mockGenerateText(type: "research" | "draft" | "refinement", topic = ""): Promise<MockAIResponse> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, 1500))

  let text = templates[type]

  // Personalizar el texto según el tema si se proporciona
  if (topic) {
    if (type === "research") {
      text = text.replace("regulación de IA", `regulación de ${topic}`)
    } else if (type === "draft" || type === "refinement") {
      text = text.replace("SISTEMAS DE INTELIGENCIA ARTIFICIAL", topic.toUpperCase())
    }
  }

  // Simular información de uso de tokens
  const usage = {
    input_tokens: Math.floor(Math.random() * 1000) + 500,
    output_tokens: Math.floor(Math.random() * 2000) + 1000,
  }

  return { text, usage }
}

// Cargar ejemplos de proyectos de ley desde archivos JSON
export function loadExampleBills() {
  try {
    const filePath = path.join(process.cwd(), "data", "example-bills.json")
    const fileContent = readFileSync(filePath, "utf8")
    return JSON.parse(fileContent)
  } catch (error) {
    console.error("Error loading example bills:", error)
    return []
  }
}
