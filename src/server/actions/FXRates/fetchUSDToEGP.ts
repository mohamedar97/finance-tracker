"use server";

/**
 * Dummy server action that simulates a 2-second delay and returns 51
 * This can be used for testing loading states and async behavior
 */
export async function fetchUSDToEGP(): Promise<number> {
  // Simulate a 2-second delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return the fixed value of 51
  return 51;
}
