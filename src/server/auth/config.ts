import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { fetchUserAuthInfo } from "../actions/users/fetchUserAuthInfo";
import { getStringFromBuffer } from "@/lib/utils";
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

// Type for user authentication data
type AuthUser = {
  id: string;
  email: string;
  salt: string;
  hashedPassword: string;
  credentialsLogin?: boolean;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Authorize user by validating credentials
      async authorize(credentials) {
        // Parse and validate incoming credentials using Zod schema
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }
        const { email, password } = parsedCredentials.data;
        try {
          // Fetch candidate data from API based on email
          const response = await fetchUserAuthInfo({ email });
          if (typeof response.payload === "string") {
            return null;
          }
          const user = response.payload as AuthUser;
          // Hash the password using user's salt and compare with stored hashed password
          const encoder = new TextEncoder();
          const saltedPassword = encoder.encode(password + user.salt);
          const hashedPasswordBuffer = await crypto.subtle.digest(
            "SHA-256",
            saltedPassword,
          );
          const hashedPassword = getStringFromBuffer(hashedPasswordBuffer);
          if (hashedPassword === user.hashedPassword) {
            user.credentialsLogin = true;
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.error("authorize", error);

          return null;
        }
      },
    }),
    // Google OAuth provider for authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  // Custom callbacks for NextAuth
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // Secret for NextAuth JWT tokens
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
