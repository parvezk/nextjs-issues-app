import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const dbClient = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN, // Add this to your .env.local file
});

export const db = drizzle(dbClient);
