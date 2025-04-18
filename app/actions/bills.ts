"use server"

import { db } from "@/lib/db";
import { billsTable, billStatusEnum } from "@/lib/schema";
import { desc, eq, or, sql, ilike, and } from "drizzle-orm";


// Define un tipo para los proyectos de ley que devolverá la función
export type Bill = typeof billsTable.$inferSelect & { versionCount?: number }; // Añade conteo de versiones opcional

// Define un tipo para los filtros opcionales
interface GetBillsOptions {
    status?: typeof billStatusEnum.enumValues[number];
    searchTerm?: string;
}
export async function getBills(options: GetBillsOptions = {}): Promise<Bill[]> {
    const { status, searchTerm } = options;

    try {
        // 1. Inicia la consulta base con select y from
        let queryBuilder = db
            .select({
                id: billsTable.id,
                title: billsTable.title,
                content: billsTable.content,
                topic: billsTable.topic,
                status: billsTable.status,
                created_at: billsTable.created_at,
                updated_at: billsTable.updated_at,
            })
            .from(billsTable);

        // 2. Prepara las condiciones de filtrado
        const conditions = [];
        if (status) {
            conditions.push(eq(billsTable.status, status));
        }
        if (searchTerm) {
            conditions.push(
                or(
                    ilike(billsTable.title, `%${searchTerm}%`),
                    ilike(billsTable.topic, `%${searchTerm}%`)
                )
            );
        }

        // 3. Aplica el WHERE si hay condiciones
        let filteredQuery;
        if (conditions.length > 0) {
            filteredQuery = queryBuilder.where(and(...conditions));
        } else {
            filteredQuery = queryBuilder; // Si no hay filtros, usa el queryBuilder original
        }

        // 4. Aplica el ORDER BY a la consulta (filtrada o no)
        const finalQuery = filteredQuery.orderBy(desc(billsTable.updated_at));

        // 5. Ejecuta la consulta final
        const bills = await finalQuery;

        return bills.map(bill => ({ ...bill, versionCount: undefined }));

    } catch (error) {
        console.error("Error fetching bills:", error);
        return [];
    }
}