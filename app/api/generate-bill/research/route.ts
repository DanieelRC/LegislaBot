import { NextRequest, NextResponse } from "next/server"
import { processGenerationStep } from "@/app/actions/generate-bill"

export async function POST(request: NextRequest) {
    try {
        const { topic } = await request.json()

        if (!topic) {
            return NextResponse.json(
                { error: "El tema es requerido" },
                { status: 400 }
            )
        }

        const research = await processGenerationStep({
            stage: 'research',
            topic,
        })

        return NextResponse.json({ research })
    } catch (error) {
        console.error("Error en endpoint de investigación:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        )
    }
}
