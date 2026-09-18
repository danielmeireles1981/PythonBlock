import "server-only";
import { Pool, neonConfig, type PoolClient } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
let pool: Pool | undefined;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  return pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 4, connectionTimeoutMillis: 10000, idleTimeoutMillis: 20000 });
}
export async function query(text: string, values: unknown[] = []) { return database().query(text, values); }
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await database().connect();
  try { await client.query("BEGIN"); const value = await fn(client); await client.query("COMMIT"); return value; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
