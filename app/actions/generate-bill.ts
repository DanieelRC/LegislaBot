"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"
import { getRelevantSettings } from "./settings"
import { logApiUsage } from "./log-api-usage"

function getCurrentDateInSpanish(): { formatted: string; year: number } {
  const now = new Date();
  const formatted = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  return {
    formatted,
    year: now.getFullYear()
  };
}

// Función para verificar las API keys necesarias
function checkRequiredApiKeys() {
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!googleApiKey) {
    throw new Error("La API key de Google (GOOGLE_GENERATIVE_AI_API_KEY) no está definida en las variables de entorno");
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("La API key de OpenAI (OPENAI_API_KEY) no está definida en las variables de entorno");
  }
}

interface GenerationSettings {
  maxTokensPerRequest: number | null;
  enableApiUsageTracking: boolean;
  defaultLegislator: string | null;
}

// Función para investigar con Gemini
async function researchWithGemini(topic: string, settings: GenerationSettings): Promise<string> {
  try {
    checkRequiredApiKeys();
    const { formatted: currentDate, year: currentYear } = getCurrentDateInSpanish();

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Hoy es ${currentDate}. Realiza una investigación exhaustiva sobre "${topic}" en el contexto jurídico mexicano, especialmente aplicable a la Ciudad de México (Por ningún motivo inventes información). Identifica:
- Legislación vigente (federal y local) relacionada
- Iniciativas previas sobre el tema (si existen)
- Estudios académicos recientes (a partir de 2020 hasta ${currentYear})
- Regulaciones internacionales destacadas sobre este tema
- Principales problemas jurídicos o vacíos legales que justifican esta iniciativa
- Términos técnicos clave que deben ser definidos legalmente (mínimo 30 conceptos)

Organiza tu respuesta claramente en secciones tituladas y formatea la respuesta como una lista con las siguientes categorías:
- Título de la fuente
- Tipo (ley, iniciativa, estudio académico, regulación internacional)
- Breve resumen
- Relevancia específica para fundamentar un proyecto de ley sobre ${topic} en la Ciudad de México, periodo ${currentYear}-${currentYear + 5}
- Términos técnicos identificados que requieren definición legal`,
      temperature: 0.3,
      maxTokens: settings.maxTokensPerRequest ?? 8192, // Aumentado para investigación profunda
    });

    if (settings.enableApiUsageTracking) {
      await logApiUsage({
        apiName: "google/gemini-1.5-flash",
        tokensUsed: result.usage.totalTokens,
        requestType: "research",
      });
    }
    return result.text;
  } catch (error) {
    console.error("Error en la investigación con Gemini:", error);
    throw new Error(`Error al realizar la investigación previa: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función para generar borrador con GPT-4
async function generateDraftWithGPT4(context: string, topic: string, settings: GenerationSettings): Promise<string> {
  try {
    checkRequiredApiKeys();
    const { formatted: currentDate, year: currentYear } = getCurrentDateInSpanish();
    const legislatorInfo = settings.defaultLegislator || 'A QUIEN CORRESPONDA';

    const result = await generateText({
      model: openai("gpt-4o"),
      system: `Eres un asistente legal especializado en la redacción de proyectos de ley para la Ciudad de México.
      Debes generar un proyecto de ley COMPLETO, EXTREMADAMENTE DETALLADO Y TÉCNICO con la siguiente estructura:
      1. TÍTULO DEL PROYECTO DE LEY - Redactado formalmente
      2. EXPOSICIÓN DE MOTIVOS (considerandos) - Mínimo 1500 palabras, con fundamentación jurídica profunda
      3. ARTICULADO - Con estructura jerárquica (Títulos, Capítulos, Secciones) y numeración legal adecuada
         - Incluir CAPÍTULO DE DEFINICIONES con al menos 30 términos técnicos definidos con precisión jurídica
         - Desarrollar mínimo 50 artículos cubriendo todos los aspectos regulatorios
         - Considerar casos límite, excepciones y mecanismos de actualización
      4. DISPOSICIONES TRANSITORIAS - Detalladas y con plazos específicos
      5. FIRMA - Solo incluye "Ciudad de México, [fecha]" y el nombre del legislador
      6. REFERENCIAS - Completas y verificables con formato APA 7ma edición
      
      El proyecto debe ser técnicamente sólido, jurídicamente viable y seguir el formato oficial de los proyectos de ley en México.
      Redacta con lenguaje técnico-jurídico formal, sin referencias partidistas. Prioriza exhaustividad y profundidad.`,
      prompt: `Hoy es ${currentDate}. Eres un experto en derecho constitucional mexicano y regulación tecnológica. Con base en la siguiente investigación (NO INVENTES INFORMACIÓN):
${context}

Redacta un proyecto de decreto EXTREMADAMENTE DETALLADO que expida una nueva ley para la Ciudad de México sobre ${topic}. El texto debe apegarse estrictamente a las normas de técnica legislativa mexicana.

ESTRUCTURA OBLIGATORIA:

TÍTULO DE LA INICIATIVA
[Redacta un título formal para la ley]

EXPOSICIÓN DE MOTIVOS (Redactalo en formato de considerandos y no separes en párrafos con títulos en esta parte, los considerandos son de dos tipos: (i) fácticos, donde se señalan los hechos que justifican la resolución; y (ii) normativos, que contienen referencia a normas preexistentes, las cuales sustentan la emisión de la nueva norma. Es costumbre que los considerandos normativos empiecen citando la existencia de una norma para luego transcribir lo que ella dice. Siguen una estructura como esta: referencia a una norma – cita textual de la Norma. No utilices siempre la palabra considerando, varía con "CONSIDERANDO", "CONSIDERA", etc. En minusculas): 
- Fundamenta con profundidad (mínimo 1500 palabras) usando:
  * 5 tratados internacionales relevantes
  * 3 jurisprudencias locales aplicables
  * 2 estudios técnicos actualizados
- Analiza vacíos legales identificados con casos concretos
- Explica cómo cada artículo resuelve problemas específicos
- Justifica la alineación con principios constitucionales

ARTICULADO
Sigue esta estructura jerárquica:
TÍTULO PRIMERO: DISPOSICIONES GENERALES
  Capítulo I - Objeto, ámbito de aplicación y principios rectores
  Capítulo II - DEFINICIONES (mínimo 30 términos técnicos definidos con precisión jurídica)
  
TÍTULO SEGUNDO: DERECHOS Y OBLIGACIONES
  Capítulo I - Derechos de los titulares
  Capítulo II - Obligaciones de los responsables
  
TÍTULO TERCERO: GOBERNANZA Y SUPERVISIÓN
  Capítulo I - Órganos de supervisión
  Capítulo II - Mecanismos de control
  
TÍTULO CUARTO: SEGURIDAD Y PROTECCIÓN DE DATOS
  Capítulo I - Medidas técnicas
  Capítulo II - Protocolos de seguridad
  
TÍTULO QUINTO: RÉGIMEN SANCIONADOR
  Capítulo I - Infracciones
  Capítulo II - Sanciones
  
(Continúa con títulos necesarios para cubrir TODOS los aspectos del tema)

Cada artículo debe:
- Ser claro, preciso y autónomo
- Contemplar excepciones y casos límite
- Incluir referencias cruzadas cuando sea necesario
- Especificar plazos y procedimientos concretos

DISPOSICIONES TRANSITORIAS
- Establece plazos realistas para implementación
- Detalla fases de adaptación
- Especifica obligaciones de transición
Ciudad de México, ${currentDate}.
${legislatorInfo}

REFERENCIAS
- Formato APA 7ma edición
- Mínimo 20 fuentes académicas/jurídicas
- Incluir:
  * Hipervínculos verificables
  * Fechas exactas de consulta
  * 5 tratados internacionales
  * 3 jurisprudencias locales
  * 2 estudios técnicos actualizados
- Solo fuentes existentes y verificables

Genera un documento JURÍDICAMENTE ROBUSTO, con mínimo 100 artículos bien estructurados, que sirva como marco regulatorio completo para ${topic} en la Ciudad de México para el periodo ${currentYear}-${currentYear + 5}.`,
      temperature: 0.2,
      maxTokens: settings.maxTokensPerRequest ?? 32768, // Aumentado para documentos extensos
    });

    if (settings.enableApiUsageTracking) {
      await logApiUsage({
        apiName: "openai/gpt-4o",
        tokensUsed: result.usage.totalTokens,
        requestType: "draft_generation",
      });
    }
    return result.text;
  } catch (error) {
    console.error("Error en la generación del borrador con GPT-4:", error);
    throw new Error("Error al generar el borrador base");
  }
}

// Función para refinar legalmente el borrador
async function refineLegalDraft(draft: string, settings: GenerationSettings): Promise<string> {
  try {
    checkRequiredApiKeys();
    const { formatted: currentDate } = getCurrentDateInSpanish();
    const legislatorInfo = settings.defaultLegislator || 'A QUIEN CORRESPONDA';

    const result = await generateText({
      model: openai("gpt-4o"),
      system: `Eres un experto legal especializado en derecho tecnológico y regulación de IA en México.
      Tu tarea es revisar, MEJORAR Y EXPANDIR sustancialmente un borrador de proyecto de ley asegurando:
      1. Consistencia terminológica y jurídica ABSOLUTA
      2. Cumplimiento ESTRICTO con la jerarquía normativa mexicana
      3. Precisión y DETALLE en las definiciones técnicas (ampliar a 40+ términos si es necesario)
      4. Verificación de que cada artículo contemple casos límite y excepciones
      5. Ampliación del articulado a 120+ artículos donde sea necesario
      6. Integración PERFECTA de citas y referencias
      7. PRESERVACIÓN de la estructura jerárquica (Títulos, Capítulos, Artículos)`,
      prompt: `Como experto legal en regulación tecnológica, revisa, MEJORA SUSTANCIALMENTE y EXPANDE el siguiente borrador para la Ciudad de México. Transforma este documento en un texto legislativo PROFESIONAL, COMPLETO Y TÉCNICAMENTE PERFECTO.

Revisión crítica obligatoria:
1. AMPLIAR el capítulo de definiciones a 40+ términos técnicos con precisión jurídica
2. VERIFICAR que cada artículo contemple:
   - Excepciones aplicables
   - Casos límite no obvios
   - Mecanismos de actualización
3. ASEGURAR concordancia con legislación complementaria
4. AÑADIR 20% más de artículos donde sea necesario para cobertura completa
5. GARANTIZAR que todas las referencias estén:
   - Correctamente citadas en el texto (Autor, Año, p. X)
   - Incluidas en la sección de REFERENCIAS con hipervínculos verificables
6. FIRMA: Mantener EXACTAMENTE "Ciudad de México, [fecha]" y nombre del legislador antes de las referencias

El borrador a transformar es:

${draft}

Entrega ÚNICAMENTE el texto legal mejorado, SIN comentarios ni letra en negritas, adémas las definiciones deben de ir enumeradas con números romanos. El resultado debe ser un documento FORMAL, EXHAUSTIVO Y LISTO PARA PRESENTACIÓN, con más de 100 artículos y 40+ definiciones técnicas.`,
      temperature: 0.1,
      maxTokens: settings.maxTokensPerRequest ?? 32768, // Aumentado para expansión sustancial
    });

    if (settings.enableApiUsageTracking) {
      await logApiUsage({
        apiName: "openai/gpt-4o",
        tokensUsed: result.usage.totalTokens,
        requestType: "refinement",
      });
    }
    return result.text;
  } catch (error) {
    console.error("Error en el refinamiento legal:", error);
    throw new Error("Error al refinar el proyecto de ley");
  }
}

export type GenerationStage = 'research' | 'draft' | 'refine';

interface ProcessStepArgs {
  stage: GenerationStage;
  topic: string;
  inputData?: string;
}

export async function processGenerationStep(args: ProcessStepArgs): Promise<string> {
  const { stage, topic, inputData } = args;

  try {
    const settings = await getRelevantSettings();

    switch (stage) {
      case 'research':
        return await researchWithGemini(topic, settings);
      case 'draft':
        if (!inputData) {
          throw new Error("Se requiere contexto de investigación para la etapa de redacción");
        }
        return await generateDraftWithGPT4(inputData, topic, settings);
      case 'refine':
        if (!inputData) {
          throw new Error("Se requiere borrador inicial para la etapa de refinamiento");
        }
        return await refineLegalDraft(inputData, settings);
      default:
        throw new Error("Etapa de generación inválida");
    }
  } catch (error) {
    console.error(`Error en processGenerationStep (etapa: ${stage}):`, error);
    throw new Error(`Error durante la etapa '${stage}': ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Función completa para generación de leyes
export async function generateFullLaw(topic: string): Promise<string> {
  try {
    const settings = await getRelevantSettings();

    // Etapa 1: Investigación profunda
    console.log("Iniciando investigación...");
    const research = await researchWithGemini(topic, { ...settings, maxTokensPerRequest: 8192 });

    // Etapa 2: Generación de borrador técnico-jurídico
    console.log("Generando borrador...");
    const draft = await generateDraftWithGPT4(research, topic, { ...settings, maxTokensPerRequest: 32768 });

    // Etapa 3: Refinamiento experto
    console.log("Refinando documento...");
    const refined = await refineLegalDraft(draft, { ...settings, maxTokensPerRequest: 32768 });

    return refined;
  } catch (error) {
    console.error("Error en el proceso completo de generación de ley:", error);
    throw new Error(`Proceso fallido: ${error instanceof Error ? error.message : String(error)}`);
  }
}