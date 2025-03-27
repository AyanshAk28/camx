import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import { log } from "./vite";

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a connection pool
const pool = new Pool({ connectionString: databaseUrl });

// Create a Drizzle client
export const db = drizzle(pool, { schema });

// Test database connection
export async function testDatabaseConnection() {
  try {
    log("Testing database connection...", "database");
    const result = await pool.query("SELECT NOW()");
    log(`Database connection successful: ${result.rows[0].now}`, "database");
    return true;
  } catch (error) {
    log(`Database connection error: ${error}`, "database");
    return false;
  }
}