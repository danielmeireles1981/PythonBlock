import { Client, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;
import fs from 'node:fs/promises';
if (!process.env.DATABASE_URL) throw Error('DATABASE_URL não configurada.');
const client = new Client({connectionString: process.env.DATABASE_URL, connectionTimeoutMillis:15000});
await client.connect();
try {
 await client.query('BEGIN');
 await client.query('SELECT pg_advisory_xact_lock(7843921)');
 await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())');
 for (const file of (await fs.readdir('db')).filter(n=>n.endsWith('.sql')).sort()) {
  if (!(await client.query('SELECT name FROM schema_migrations WHERE name=$1',[file])).rowCount) {
   await client.query(await fs.readFile('db/'+file,'utf8'));
   await client.query('INSERT INTO schema_migrations(name) VALUES($1)',[file]);
   console.log('Migração aplicada:',file);
  }
 }
 await client.query('COMMIT');
} catch(e) { await client.query('ROLLBACK'); throw e; } finally { await client.end(); }
