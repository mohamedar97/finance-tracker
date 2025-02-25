"use server";

import { z } from "zod";
import { getStringFromBuffer } from "@/lib/utils";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export const signUp = async (formData: FormData) => {
  // Extract data from the request body
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const password = formData.get("password") as string;

  // Validate the incoming data using Zod schema
  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      phoneNumber: z.string().min(10),
    })
    .safeParse({
      email,
      password,
      name,
      phoneNumber,
    });

  // If validation fails, return an error response
  if (!parsedCredentials.success) {
    console.log(parsedCredentials.error.message);
    throw new Error(parsedCredentials.error.message);
  }
  // Generate a salt and hash the password
  const salt = crypto.randomUUID();
  const encoder = new TextEncoder();
  const saltedPassword = encoder.encode(password + salt);
  const hashedPasswordBuffer = await crypto.subtle.digest(
    "SHA-256",
    saltedPassword,
  );
  const hashedPassword = getStringFromBuffer(hashedPasswordBuffer);
  try {
    // Insert user data into the database
    const result = await db
      .insert(users)
      .values({
        name,
        phoneNumber,
        email,
        hashedPassword,
        salt,
      })
      .onConflictDoNothing({ target: users.email })
      .returning({ id: users.id });

    if (result.length === 0) {
      // Return error response if user already exists
      throw new Error("User already exists!");
    }
    // Return success response if the user is created
    return {
      data: { email, password },
    };
  } catch (error: any) {
    console.error("########## signup ##########");
    console.log(error);
    // Return error response for other database errors

    return {
      data: null,
      error: "Failed to create your account. Please try again later.",
    };
  }
};
