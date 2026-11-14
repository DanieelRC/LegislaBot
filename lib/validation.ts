import { z } from "zod"

export const TOPIC_MAX = 300

/** Limpia el tema: sin caracteres de control ni delimitadores que puedan romper el prompt. */
const topic = z
  .string()
  .transform((v) => v.replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim())
  .pipe(z.string().min(3, "Describe el tema con al menos 3 caracteres").max(TOPIC_MAX, `El tema no puede superar ${TOPIC_MAX} caracteres`))

const token = z.string().min(20).max(600)
const research = z.string().min(1).max(40_000)
const lawTitle = z.string().min(3).max(400)

export const outlineItemSchema = z.object({
  heading: z.string().min(3).max(200),
  chapters: z.string().max(800),
  range: z.string().max(80),
})
export type OutlineItem = z.infer<typeof outlineItemSchema>

const outline = z.array(outlineItemSchema).min(1).max(10)

export const generateRequestSchema = z.discriminatedUnion("step", [
  z.object({ step: z.literal("research"), topic }),
  z.object({ step: z.literal("outline"), topic, token, research }),
  z.object({ step: z.literal("exposition"), topic, token, research, lawTitle }),
  z.object({
    step: z.literal("title"),
    topic,
    token,
    research,
    lawTitle,
    outline,
    index: z.number().int().min(0).max(9),
  }),
  z.object({ step: z.literal("closing"), topic, token, research, lawTitle, outline }),
])
export type GenerateRequest = z.infer<typeof generateRequestSchema>
export type GenerationStep = GenerateRequest["step"]

export const draftInputSchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().min(20).max(300_000),
})

export const draftIdSchema = z.coerce.number().int().positive()

/** Únicas claves de configuración que se pueden leer o modificar desde la app. */
export const SETTING_KEYS = ["default_legislator", "enable_api_usage_tracking"] as const

export const settingsSchema = z
  .object({
    default_legislator: z.string().trim().max(120),
    enable_api_usage_tracking: z.enum(["true", "false"]),
  })
  .partial()
  .strict()
export type PublicSettings = z.infer<typeof settingsSchema>
