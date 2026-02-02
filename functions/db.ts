import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Types for Cloudflare Workers
export interface Env {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  NODE_ENV: string;
}

let cachedDb: ReturnType<typeof drizzle> | null = null;

export function getDB(env: Env) {
  if (cachedDb) return cachedDb;
  
  const client = postgres(env.DATABASE_URL, {
    prepare: false,
    max: 1, // Limit connections in edge environment
  });
  cachedDb = drizzle(client);
  return cachedDb;
}
