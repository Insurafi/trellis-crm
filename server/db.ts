import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create a PostgreSQL client with your connection string
const client = postgres(process.env.DATABASE_URL!);

// Create a Drizzle instance using the PostgreSQL client
export const db = drizzle(client);