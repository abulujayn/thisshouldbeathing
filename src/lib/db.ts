import { Pool } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const pool = new Pool({ connectionString: dbUrl });

let schemaInitialized = false;

export async function ensureSchema() {
  if (schemaInitialized) return;

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ideas (
        host TEXT NOT NULL,
        id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        author_email TEXT NOT NULL,
        votes INTEGER DEFAULT 0,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (host, id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        host TEXT NOT NULL,
        idea_id TEXT NOT NULL,
        id TEXT NOT NULL,
        text TEXT NOT NULL,
        author_email TEXT NOT NULL,
        created_at BIGINT NOT NULL,
        PRIMARY KEY (host, idea_id, id),
        FOREIGN KEY (host, idea_id) REFERENCES ideas(host, id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS admin_data (
        host TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        credential_id TEXT,
        credential_public_key TEXT,
        credential_counter INTEGER,
        credential_transports TEXT
      );

      CREATE TABLE IF NOT EXISTS auth_codes (
        host TEXT NOT NULL,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at BIGINT NOT NULL,
        PRIMARY KEY (host, email)
      );
    `);
    schemaInitialized = true;
  } finally {
    client.release();
  }
}
