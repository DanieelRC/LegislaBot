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
      model: google("gemini-1.5-pro"),
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
      maxTokens: settings.maxTokensPerRequest ?? undefined, // Use setting
    });

    // Log API usage if enabled
    if (settings.enableApiUsageTracking) {
      await logApiUsage({
        apiName: "google/gemini-1.5-pro",
        tokensUsed: result.usage.totalTokens,
        requestType: "research",
        // costEstimate: calculateCost(result.usage, "gemini-1.5-pro") // Optional: Implement cost calculation
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
      Debes generar un proyecto de ley completo con la siguiente estructura:
      1. TÍTULO DEL PROYECTO DE LEY
      2. EXPOSICIÓN DE MOTIVOS (considerandos)
      3. ARTICULADO (con numeración y formato legal adecuado)
      4. DISPOSICIONES TRANSITORIAS
      
      El proyecto debe ser técnicamente sólido, jurídicamente viable y seguir el formato oficial de los proyectos de ley en México.`,
      prompt: `Hoy es ${currentDate}. Eres un experto en derecho constitucional mexicano y nuevas tecnologías. Con base en la siguiente información recopilada (Por ningun motivo inventes información o agregues fuentes que no esten citadas y verificadas):
${context}

Genera un borrador extenso de iniciativa de ley nueva (revisa que no exista) para la Ciudad de México con el siguiente formato obligatorio:

TÍTULO DE LA INICIATIVA  
[Redacta un título claro, específico y orientado a la regulación de ${topic}]

EXPOSICIÓN DE MOTIVOS
Desarrolla clara y de manera extensa los siguientes puntos:
- Diagnóstico del problema actual relacionado con el uso de IA.
- Justificación jurídica, social y tecnológica de la iniciativa.
- Beneficios esperados e impactos económicos, políticos y sociales.
- Referencias explícitas y citadas adecuadamente de la información proporcionada.

ARTICULADO
Redacta con claridad jurídica usando el formato:
- Si la propuesta afecta un solo ordenamiento: ARTÍCULO ÚNICO
- Si afecta varios ordenamientos: ARTÍCULO PRIMERO, ARTÍCULO SEGUNDO, etc.
Incluye definiciones claras y precisas para términos técnicos relacionados con la IA.

DISPOSICIONES TRANSITORIAS
Establece plazos realistas y claros para la entrada en vigor, implementación y adaptación institucional.

${legislatorInfo} ${currentDate} Ciudad de México {/* Include legislator info, date and city*/}

Tu redacción debe ser clara, técnicamente precisa y jurídicamente impecable, adecuada al marco jurídico mexicano para el periodo ${currentYear}-${currentYear + 5}.
`,
      temperature: 0.2,
      maxTokens: settings.maxTokensPerRequest ?? undefined,
    });

    // Log API usage if enabled
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
      Tu tarea es revisar y refinar un borrador de proyecto de ley para asegurar:
      1. Consistencia terminológica y jurídica
      2. Cumplimiento con la jerarquía normativa mexicana
      3. Precisión en las definiciones técnicas
      4. Viabilidad de implementación
      5. Estilo jurídico formal adecuado`,
      prompt: `Como experto legal especializado en regulación tecnológica y derecho constitucional mexicano, revisa, mejora, expande (agregando información relevante y usando lenguaje especializado) y corrige el siguiente borrador de iniciativa de ley para la Ciudad de México.

Tu revisión debe asegurar rigurosamente:
1. Coherencia jurídica y técnica.
2. Cumplimiento explícito con el marco constitucional mexicano y leyes secundarias vigentes.
3. Claridad en las definiciones técnicas y jurídicas relativas a la inteligencia artificial.
4. Evaluación crítica y propuesta de ajustes en la viabilidad práctica de su implementación.
5. Formato formal estrictamente acorde con el modelo oficial (Título, Exposición de Motivos, Articulado, Disposiciones Transitorias).

      El borrador a revisar es el siguiente:

      
      ${draft}
      
      Mantén la estructura original, pero realiza ajustes significativos para perfeccionar el texto jurídico final. No coloques Comentarios y Ajustes Propuestos, únicamente dame el texto corregido, mejorado y no coloques texto en negritas. El resultado debe ser un texto legal formal, claro y preciso, listo para su presentación ante el Congreso de la Ciudad de México.`,
      temperature: 0.1,
      maxTokens: settings.maxTokensPerRequest ?? undefined, // Use setting
    });

    // Log API usage if enabled
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

// Función principal que orquesta todo el proceso
export async function generateBill(topic: string): Promise<string> {
  try {
    // Obtener configuraciones relevantes
    const settings = await getRelevantSettings();

    // Paso 1: Investigación previa con Gemini
    const researchContext = await researchWithGemini(topic, settings);

    // Paso 2: Generar borrador base con GPT-4
    const initialDraft = await generateDraftWithGPT4(researchContext, topic, settings);

    // Paso 3: Refinamiento legal
    const finalBill = await refineLegalDraft(initialDraft, settings);

    return finalBill;
  } catch (error) {
    console.error("Error en el proceso de generación del proyecto de ley:", error);
    throw new Error(`Error al generar el proyecto de ley: ${error instanceof Error ? error.message : String(error)}`);
  }
}
