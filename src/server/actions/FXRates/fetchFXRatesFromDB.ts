"use server";

import { db } from "../../db";
import { currencyRates } from "../../db/schema";
import { desc, and, gte } from "drizzle-orm";

/**
 * Fetches the latest FX rates from the database
 * Only returns rates from the last 24 hours
 * @returns The latest FX rates or null if no recent rates exist
 */
export async function fetchFXRatesFromDB() {
  try {
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Query the database for the latest FX rates within the last 24 hours
    const latestRates = await db.query.currencyRates.findFirst({
      where: and(gte(currencyRates.createdAt, twentyFourHoursAgo)),
      orderBy: [desc(currencyRates.createdAt)],
    });

    // Return the rates or null if none found
    return latestRates;
  } catch (error) {
    console.error("Error fetching latest FX rates:", error);
    throw new Error("Failed to fetch latest FX rates");
  }
}
