"use server"

import { db } from "@/lib/db"
import { apiUsageTable } from "@/lib/schema"

interface ApiUsageDetails {
    apiName: string;
    tokensUsed: number;
    costEstimate?: number; // Optional cost
    requestType: string;
}

export async function logApiUsage({
    apiName,
    tokensUsed,
    costEstimate = 0, // Default cost to 0 if not provided
    requestType,
}: ApiUsageDetails): Promise<void> {
    try {
        await db.insert(apiUsageTable).values({
            api_name: apiName,
            tokens_used: tokensUsed,
            cost_estimate: costEstimate.toString(), // Ensure it's a string for decimal
            request_type: requestType,
        });
        console.log(`API Usage logged: ${apiName}, Tokens: ${tokensUsed}, Type: ${requestType}`);
    } catch (error) {
        console.error("Error logging API usage:", error);
        // Decide if you want to throw the error or just log it
        // throw new Error("Failed to log API usage");
    }
}
