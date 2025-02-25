"use server";
import { tavily } from "@tavily/core";
import { z } from "zod";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

/**
 * Fetches both USD to EGP and Gold to EGP rates from the web
 * @returns An object containing both rates
 */
export async function fetchFXRatesFromWeb(): Promise<{
  usdRate: number;
  goldRate: number;
  timestamp: Date;
}> {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

  // Fetch both rates in parallel
  const [usdResults, goldResults] = await Promise.all([
    tvly.search(`USD to EGP exchange rate in Egypt today`, {
      num_results: 2,
    }),
    tvly.search(` سعر الذهب اليوم في مصر عيار ٢١ اليوم السابع و مصراوي`, {
      num_results: 2,
    }),
  ]);

  // Process both results in parallel
  const [usdData, goldData] = await Promise.all([
    generateObject({
      model: anthropic("claude-3-haiku-20240307"),
      schema: z.object({
        rate: z.number(),
      }),
      prompt: `Today's date is ${new Date().toLocaleDateString()}
 Extract the USD to EGP exchange rate for today from the following search results: ${JSON.stringify(
   usdResults,
 )}
      `,
    }),
    generateObject({
      model: anthropic("claude-3-haiku-20240307"),
      schema: z.object({
        rate: z.number(),
      }),
      prompt: `Today's date is ${new Date().toLocaleDateString()}
 Extract the gold price for one gram of 21 carat gold in Egypt in EGP for today from the following search results: ${JSON.stringify(
   goldResults,
 )}
      `,
    }),
  ]);

  return {
    usdRate: usdData.object.rate,
    goldRate: goldData.object.rate,
    timestamp: new Date(),
  };
}
