import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Pool } from 'pg';

// Create a PostgreSQL client with your connection string for Drizzle
const client = postgres(process.env.DATABASE_URL!);

// Create a PostgreSQL pool for session storage and other pg-specific operations
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle instance using the PostgreSQL client
export const db = drizzle(client);