"use server";

/**
 * Dummy server action that simulates a 2-second delay and returns 4000
 * This can be used for testing loading states and async behavior
 */
export async function fetchGoldToEGP(): Promise<number> {
  // Simulate a 2-second delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return the fixed value of 4000
  return 4000;
}
