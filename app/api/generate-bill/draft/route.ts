import { NextRequest, NextResponse } from "next/server"
import { processGenerationStep } from "@/app/actions/generate-bill"

export async function POST(request: NextRequest) {
    try {
        const { topic, researchContext } = await request.json()

        if (!topic || !researchContext) {
            return NextResponse.json(
                { error: "El tema y contexto de investigación son requeridos" },
                { status: 400 }
            )
        }

        const draft = await processGenerationStep({
            stage: 'draft',
            topic,
            inputData: researchContext,
        })

        return NextResponse.json({ draft })
    } catch (error) {
        console.error("Error en endpoint de borrador:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
