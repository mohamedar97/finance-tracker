"use server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

// Handler function to handle GET requests for fetching user information
export const fetchUserAuthInfo = async ({ email }: { email: string }) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email));
    // If no user found, return success response with null data
    if (result.length === 0 || !result[0]) {
      console.log("No auth user found");
      throw new Error("User not found");
    }
    // Creating a candidate object with fetched user data
    const retrievedCandidate = {
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      phoneNumber: result[0].phoneNumber,
      hashedPassword: result[0].hashedPassword,
      salt: result[0].salt,
    };

    // Generating success response with fetched retrievedCandidate data
    return {
      type: "success",
      payload: retrievedCandidate,
    };
  } catch (error: unknown) {
    console.error("########## getUser ##########"); // Logging error
    console.error(error); // Logging error details

    return {
      type: "error",
      payload: error instanceof Error ? error.message : "An error has occurred",
    };
  }
};
