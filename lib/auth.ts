import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { randomUUID } from "crypto";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    advanced:{
      database:{
        generateId: () => randomUUID(),
      }
    },
    emailAndPassword:{
        enabled: true, 
    },
    user: {
    additionalFields: {
      role: { type: "string", default: "member" },
    },
  },
   plugins: [nextCookies()],
});