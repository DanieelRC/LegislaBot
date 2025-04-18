"use server"

import { db } from "@/lib/db"
import { settingsTable } from "@/lib/schema"
import { eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export interface Setting {
    key: string
    value: string
    description?: string
}

// Obtener todas las configuraciones
export async function getAllSettings(): Promise<Setting[]> {
    try {
        const result = await db
            .select({
                key: settingsTable.key,
                value: settingsTable.value,
                description: settingsTable.description,
            })
            .from(settingsTable)

        return result.map(row => ({
            key: row.key,
            value: row.value,
            description: row.description ?? undefined,
        }))
    } catch (error) {
        console.error("Error al obtener configuraciones:", error)
        return []
    }
}


// Obtener valor de una configuración específica
export async function getSetting(key: string): Promise<string | null> {
    try {
        // Usar limit(1) y desestructuración para obtener solo el primer resultado
        const [row] = await db
            .select({ value: settingsTable.value })
            .from(settingsTable)
            .where(eq(settingsTable.key, key))
            .limit(1)

        // Manejar el caso donde no se encuentra la configuración
        return row?.value ?? null
    } catch (error) {
        console.error(`Error al obtener configuración ${key}:`, error)
        return null
    }
}

// Obtener configuraciones relevantes para la generación de proyectos
export async function getRelevantSettings(): Promise<{
    defaultLegislator: string | null;
    maxTokensPerRequest: number | null;
    enableApiUsageTracking: boolean;
}> {
    const relevantKeys = [
        'default_legislator',
        'max_tokens_per_request',
        'enable_api_usage_tracking'
    ];
    try {
        const results = await db
            .select({
                key: settingsTable.key,
                value: settingsTable.value,
            })
            .from(settingsTable)
            .where(inArray(settingsTable.key, relevantKeys));

        const settingsMap = results.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {} as Record<string, string>);

        return {
            defaultLegislator: settingsMap['default_legislator'] ?? null,
            maxTokensPerRequest: settingsMap['max_tokens_per_request']
                ? parseInt(settingsMap['max_tokens_per_request'], 10)
                : null,
            enableApiUsageTracking: settingsMap['enable_api_usage_tracking'] === 'true',
        };
    } catch (error) {
        console.error("Error al obtener configuraciones relevantes:", error);
        // Return default values in case of error
        return {
            defaultLegislator: null,
            maxTokensPerRequest: null, // Or a sensible default like 4096
            enableApiUsageTracking: false,
        };
    }
}

// Actualizar una configuración
export async function updateSetting(key: string, value: string): Promise<boolean> {
    try {
        await db
            .update(settingsTable)
            .set({ value })
            .where(eq(settingsTable.key, key))

        revalidatePath("/settings")
        return true
    } catch (error) {
        console.error(`Error al actualizar configuración ${key}:`, error)
        return false
    }
}

export async function updateSettings(settings: Record<string, string>): Promise<boolean> {
    try {
        // Ejecutar actualizaciones secuencialmente sin transacción
        for (const [key, value] of Object.entries(settings)) {
            await db
                .update(settingsTable)
                .set({ value })
                .where(eq(settingsTable.key, key));
        }

        revalidatePath("/settings");
        return true;
    } catch (error) {
        console.error("Error al actualizar configuraciones:", error);
        return false;
    }
}