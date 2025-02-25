"use server";

import { db } from "../../db";
import { currencyRates } from "../../db/schema";
import { fetchFXRatesFromWeb } from "./fetchFXRatesFromWeb";
import { fetchFXRatesFromDB } from "./fetchFXRatesFromDB";

/**
 * Fetches FX rates from the web and stores them in the database if needed
 * Only fetches new rates if there are no rates from the last 24 hours
 * @returns The latest FX rates (either from DB or newly fetched)
 */
export async function fetchAndStoreFXRates({
  forceRefresh = false,
}: { forceRefresh?: boolean } = {}) {
  try {
    // First check if we have recent rates in the database
    const existingRates = await fetchFXRatesFromDB();

    // If we have recent rates, return them
    if (existingRates && !forceRefresh) {
      return {
        usdRate: existingRates.usdRate,
        goldRate: existingRates.goldGrate,
        source: "database",
        timestamp: existingRates.createdAt,
      };
    }

    // If no recent rates, fetch from the web
    const { usdRate, goldRate } = await fetchFXRatesFromWeb();

    // Store the new rates in the database
    const insertResult = await db
      .insert(currencyRates)
      .values({
        usdRate: usdRate.toString(),
        goldGrate: goldRate.toString(),
      })
      .returning();

    const newRate = insertResult[0];

    if (!newRate) {
      throw new Error("Failed to insert new FX rates");
    }
    // Return the newly fetched and stored rates
    return {
      usdRate: newRate.usdRate,
      goldRate: newRate.goldGrate,
      source: "web",
      timestamp: newRate.createdAt,
    };
  } catch (error) {
    console.error("Error fetching and storing FX rates:", error);
    throw new Error("Failed to fetch and store FX rates");
  }
}
