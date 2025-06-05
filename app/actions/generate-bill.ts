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
      model: google("gemini-1.5-flash"), // Changed to 1.5-flash for potentially faster research
      prompt: `Hoy es ${currentDate}. Realiza una investigación exhaustiva sobre "${topic}" en el contexto jurídico mexicano, especialmente aplicable a la Ciudad de México (Por ningun motivo inventes información). Identifica:
- Legislación vigente (federal y local) relacionada.
- Iniciativas previas sobre el tema (si existen).
- Estudios académicos recientes (a partir de 2020 hasta ${currentYear}).
- Regulaciones internacionales destacadas sobre este tema.
- Principales problemas jurídicos o vacíos legales que justifican esta iniciativa.

Organiza tu respuesta claramente en secciones tituladas y formatea la respuesta como una lista con las siguientes categorías:
- Título de la fuente
- Tipo (ley, iniciativa, estudio académico, regulación internacional)
- Breve resumen
- Relevancia específica para fundamentar un proyecto de ley sobre ${topic} en la Ciudad de México, periodo ${currentYear}-${currentYear + 5}.`,
      temperature: 0.3,
      maxTokens: settings.maxTokensPerRequest ?? 4096, // Keeping research at 4096
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
    const legislatorInfo = settings.defaultLegislator ? `Considera que este proyecto podría ser presentado por ${settings.defaultLegislator}.` : '';

    const result = await generateText({
      model: openai("gpt-4o"),
      system: `Eres un asistente legal especializado en la redacción de proyectos de ley para la Ciudad de México.
      Debes generar un proyecto de ley completo y MUY EXTENSO con la siguiente estructura:
      1. TÍTULO DEL PROYECTO DE LEY
      2. EXPOSICIÓN DE MOTIVOS (considerandos) - Esta sección debe ser particularmente detallada, profunda y exhaustiva.
      3. ARTICULADO (con numeración y formato legal adecuado) - Desarrolla un articulado completo, con múltiples capítulos y secciones si es necesario para cubrir el tema a profundidad. Considera todos los aspectos relevantes.
      4. DISPOSICIONES TRANSITORIAS - Detalla las disposiciones necesarias.
      5. REFERENCIAS - Asegúrate de que sean completas y bien formateadas.
      El proyecto debe ser técnicamente sólido, jurídicamente viable y seguir el formato oficial de los proyectos de ley en México.
      Redacta con lenguaje técnico-jurídico formal, sin referencias partidistas o ideológicas. El documento debe ser compatible con los principios de legalidad, seguridad jurídica y protección de derechos fundamentales, conforme a la Constitución Política de los Estados Unidos Mexicanos y tratados internacionales firmados por México. No incluyas menciones a actores políticos, partidos o bancadas legislativas. Prioriza la exhaustividad y profundidad del contenido.`,
      prompt: `Hoy es ${currentDate}. Eres un experto en derecho constitucional mexicano y nuevas tecnologías. Con base en la siguiente información recopilada (Por ningun motivo inventes información o agregues fuentes que no esten citadas y verificadas):
${context}

Redacta un proyecto de decreto MUY EXTENSO Y DETALLADO que expida una ley nueva para la Ciudad de México, cuidando que no exista previamente una legislación igual o sustancialmente similar. El texto debe apegarse a las normas de técnica legislativa mexicana y estructurarse de la siguiente manera, sin utilizar estilo en negritas, cursivas o listas con viñetas. El objetivo es producir un documento legislativo completo y exhaustivo.

TÍTULO DE LA INICIATIVA  (No añadas este texto de título, únicamente el redactado)
[Redacta un título claro, específico y orientado a la regulación de ${topic}]

EXPOSICIÓN DE MOTIVOS
- Desarrolla esta sección de forma MUY AMPLIA Y PROFUNDA. Apóyate en antecedentes normativos nacionales e internacionales citados explícitamente, explicando su relevancia y conexión con la propuesta.
- Detalla, si aplica, casos recientes (como demandas o litigios relevantes) que hayan evidenciado vacíos legales en el tema abordado, explicando las implicaciones.
- Justifica de manera exhaustiva cómo esta ley evitará o mitigará los efectos adversos documentados del uso indebido de la IA, proporcionando ejemplos y escenarios.
- Explica con gran detalle cómo la ley se alinea con los principios de transparencia, rendición de cuentas y protección de derechos humanos, y cómo fortalecerá estos aspectos.
- Incluye análisis comparado con otras jurisdicciones si es pertinente.

ARTICULADO
Redacta un cuerpo normativo COMPLETO Y EXTENSO. Usa el formato:
- Si la propuesta afecta un solo ordenamiento: ARTÍCULO ÚNICO
- Si afecta varios ordenamientos: ARTÍCULO PRIMERO, ARTÍCULO SEGUNDO, etc.
Define cada término técnico relacionado con la IA de manera clara y precisa. Desarrolla capítulos y secciones que aborden todos los aspectos relevantes del tema ${topic}, incluyendo (pero no limitándose a) ámbito de aplicación, sujetos obligados, derechos, obligaciones, principios rectores, mecanismos de supervisión, régimen de sanciones, y cualquier otro elemento necesario para una regulación integral y detallada. Cada artículo debe ser claro, preciso y jurídicamente robusto.

DISPOSICIONES TRANSITORIAS
Establece plazos realistas y claros para la entrada en vigor, implementación progresiva, y adaptación institucional, detallando los pasos necesarios.

${legislatorInfo} ${currentDate} Ciudad de México {/* Include legislator info, date and city*/}

REFERENCIAS
Incluye las referencias conforme al estilo APPA 7ma edición. Toda fuente utilizada debe:
- Estar referenciada explícitamente dentro del cuerpo del texto (por ejemplo: “como señala la OCDE (2021)...”).
- Al final, incluir la lista completa de referencias bajo el epígrafe “REFERENCIAS”, con autor, año, título, fuente, URL (si aplica) y fecha de consulta.
- Las referencias legislativas deben incluir el nombre exacto del instrumento jurídico, año de publicación, y fuente de consulta oficial.
- No se permiten referencias genéricas ni inventadas. Si no hay fuente verificable, omite esa parte.
- Asegúrate de que cada referencia contenga, en su caso, el hipervínculo de consulta directa y la fecha exacta en la que fue consultada.

Tu redacción debe ser clara, técnicamente precisa, jurídicamente impecable y, sobre todo, EXTENSA Y DETALLADA, adecuada al marco jurídico mexicano para el periodo ${currentYear}-${currentYear + 5}.
`,
      temperature: 0.2, // Low temperature for factual consistency, extensiveness comes from prompt.
      maxTokens: settings.maxTokensPerRequest ?? 16384, // Increased maxTokens for draft
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
    const result = await generateText({
      model: openai("gpt-4o"),
      system: `Eres un experto legal especializado en derecho tecnológico y regulación de IA en México.
      Tu tarea es revisar, MEJORAR SIGNIFICATIVAMENTE Y EXPANDIR un borrador de proyecto de ley para asegurar:
      1. Consistencia terminológica y jurídica ABSOLUTA.
      2. Cumplimiento ESTRICTO con la jerarquía normativa mexicana.
      3. Precisión y DETALLE en las definiciones técnicas y jurídicas.
      4. Viabilidad de implementación, proponiendo ajustes CONCRETOS si es necesario.
      5. Estilo jurídico formal adecuado, ELEVANDO la calidad del texto.
      6. PROFUNDIZAR Y AMPLIAR el contenido existente, añadiendo análisis, ejemplos y justificaciones donde sea pertinente para lograr un documento MÁS COMPLETO Y ROBUSTO.
      7. CRÍTICO: Asegurar que TODAS las afirmaciones basadas en fuentes externas en la Exposición de Motivos y otras secciones estén CORRECTAMENTE CITADAS en el texto (ej. Apellido, Año) y que estas citas correspondan a la lista de REFERENCIAS. Preservar las citas existentes del borrador y añadir nuevas si se introduce nueva información referenciada.`,
      prompt: `Como experto legal especializado en regulación tecnológica y derecho constitucional mexicano, revisa, MEJORA SUSTANCIALMENTE, EXPANDE SIGNIFICATIVAMENTE (agregando información relevante, análisis más profundos, y usando lenguaje especializado y detallado) y corrige el siguiente borrador de iniciativa de ley para la Ciudad de México. El objetivo es transformarlo en un documento legislativo mucho más extenso, detallado y robusto.

Tu revisión debe asegurar rigurosamente:
1. Coherencia jurídica y técnica IMPECABLE.
2. Cumplimiento explícito y detallado con el marco constitucional mexicano y leyes secundarias vigentes.
3. Claridad, PRECISIÓN Y PROFUNDIDAD en las definiciones técnicas y jurídicas relativas a la inteligencia artificial, expandiéndolas si es necesario.
4. Evaluación crítica y propuesta de ajustes en la viabilidad práctica de su implementación, detallando las implicaciones.
5. Formato formal estrictamente acorde con el modelo oficial (Título, Exposición de Motivos, Articulado, Disposiciones Transitorias).
6. MANTENIMIENTO Y CORRECTA INTEGRACIÓN DE CITAS: Las referencias en formato APA 7ma edición deben estar correctamente citadas DENTRO del texto de la Exposición de Motivos (ejemplo: (Autor, Año, p. X)). ES FUNDAMENTAL que todas las fuentes listadas en la sección REFERENCIAS que respalden afirmaciones en la Exposición de Motivos sean explícitamente citadas en el cuerpo del texto. PRESERVA las citas existentes del borrador original y ASEGÚRATE de que cualquier nueva información o expansión que introduzcas y que provenga de una fuente esté debidamente citada en el texto. Si añades referencias nuevas, cítalas apropiadamente.
7. EXPANDIR cada sección, especialmente la Exposición de Motivos y el Articulado, para cubrir todos los ángulos posibles del tema, añadir más detalle, justificaciones más elaboradas y un análisis más profundo.

      El borrador a revisar es el siguiente:

      
      ${draft}
      
      Mantén la estructura original, pero realiza ajustes significativos para perfeccionar y AMPLIAR el texto jurídico final. No coloques Comentarios y Ajustes Propuestos, únicamente dame el texto corregido, MEJORADO Y SIGNIFICATIVAMENTE EXPANDIDO, y no coloques texto en negritas. El resultado debe ser un texto legal formal, claro, preciso, y MUCHO MÁS EXTENSO Y DETALLADO, listo para su presentación ante el Congreso de la Ciudad de México, ASEGURANDO QUE TODAS LAS REFERENCIAS ESTÉN CORRECTAMENTE CITADAS EN EL TEXTO.`,
      temperature: 0.1, // Very low temperature for precision during refinement.
      maxTokens: settings.maxTokensPerRequest ?? 16384, // Increased maxTokens for refinement
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
  inputData?: string; // For 'draft' stage, this is researchContext. For 'refine' stage, this is initialDraft.
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
          throw new Error("Input data (research context) is required for drafting stage.");
        }
        return await generateDraftWithGPT4(inputData, topic, settings);
      case 'refine':
        if (!inputData) {
          throw new Error("Input data (initial draft) is required for refinement stage.");
        }
        return await refineLegalDraft(inputData, settings);
      default:
        throw new Error("Invalid generation stage provided.");
    }
  } catch (error) {
    console.error(`Error in processGenerationStep (stage: ${stage}):`, error);
    throw new Error(`Error durante la etapa '${stage}': ${error instanceof Error ? error.message : String(error)}`);
  }
}

// The original generateBill function is removed or commented out
// export async function generateBill(topic: string): Promise<string> {
//   try {
//     const settings = await getRelevantSettings();
//     const researchContext = await researchWithGemini(topic, settings);
//     const initialDraft = await generateDraftWithGPT4(researchContext, topic, settings);
//     const finalBill = await refineLegalDraft(initialDraft, settings);
//     return finalBill;
//   } catch (error) {
//     console.error("Error en el proceso de generación del proyecto de ley:", error);
//     throw new Error(`Error al generar el proyecto de ley: ${error instanceof Error ? error.message : String(error)}`);
//   }
// }
