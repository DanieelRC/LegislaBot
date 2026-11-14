// Crea/actualiza las tablas necesarias. Idempotente: se puede ejecutar varias veces.
// Uso: npm run db:migrate   (lee DATABASE_URL del entorno o de .env.local)
import { existsSync, readFileSync } from "node:fs"
import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^DATABASE_URL=(.*)$/)
    if (match) process.env.DATABASE_URL = match[1].trim().replace(/^["']|["']$/g, "")
  }
}
if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

const statements = [
  `CREATE TABLE IF NOT EXISTS drafts (
     id serial PRIMARY KEY,
     title varchar(255) NOT NULL,
     content text NOT NULL,
     owner_id varchar(64),
     bill_id integer,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE drafts ADD COLUMN IF NOT EXISTS owner_id varchar(64)`,
  `CREATE INDEX IF NOT EXISTS drafts_owner_idx ON drafts (owner_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS settings (
     id serial PRIMARY KEY,
     key varchar(100) NOT NULL UNIQUE,
     value text NOT NULL,
     description text,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  // Bases creadas con versiones anteriores del esquema
  `ALTER TABLE settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`,
  `ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()`,
  `CREATE UNIQUE INDEX IF NOT EXISTS settings_key_unique_idx ON settings (key)`,
  // Los secretos nunca deben vivir en la tabla de ajustes
  `DELETE FROM settings WHERE key IN ('openai_api_key', 'google_generative_ai_api_key', 'database_url')`,
  `CREATE TABLE IF NOT EXISTS api_usage (
     id serial PRIMARY KEY,
     api_name varchar(100) NOT NULL,
     tokens_used integer NOT NULL,
     cost_estimate numeric(10, 6) DEFAULT 0,
     request_type varchar(50),
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS rate_limits (
     key varchar(200) PRIMARY KEY,
     count integer NOT NULL DEFAULT 0,
     expires_at timestamptz NOT NULL
   )`,
]

for (const statement of statements) {
  await sql(statement)
  console.log("OK:", statement.split("\n")[0].trim())
}
console.log("Migración completada.")
