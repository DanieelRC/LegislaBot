import { NextRequest, NextResponse } from "next/server"
import { processGenerationStep } from "@/app/actions/generate-bill"

export async function POST(request: NextRequest) {
    try {
        const { draftContent } = await request.json()

        if (!draftContent) {
            return NextResponse.json(
                { error: "El contenido del borrador es requerido" },
                { status: 400 }
            )
        }

        const refined = await processGenerationStep({
            stage: 'refine',
            topic: '', // No es necesario en refinamiento
            inputData: draftContent,
        })

        return NextResponse.json({ refined })
    } catch (error) {
        console.error("Error en endpoint de refinamiento:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
