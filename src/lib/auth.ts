import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { pool, ensureSchema } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod';

export async function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function getHost() {
  const headerList = await headers();
  return headerList.get('host') || 'default';
}

// Deprecated key generator, but internal logic changes now
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAuthCodeKey(email: string) {
  // logic moved to DB query
  return '';
}

export async function storeAuthCode(email: string, code: string) {
  await ensureSchema();
  const host = await getHost();
  const client = await pool.connect();
  
  try {
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      await client.query(
          `INSERT INTO auth_codes (host, email, code, expires_at)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (host, email) DO UPDATE SET
             code = EXCLUDED.code,
             expires_at = EXCLUDED.expires_at`,
          [host, email, code, expiresAt]
      );
  } finally {
      client.release();
  }
}

export async function verifyAuthCode(email: string, code: string) {
  await ensureSchema();
  const host = await getHost();
  const client = await pool.connect();
  
  try {
      const res = await client.query(
          'SELECT code, expires_at FROM auth_codes WHERE host = $1 AND email = $2',
          [host, email]
      );
      
      if (res.rows.length === 0) return false;
      
      const { code: storedCode, expires_at } = res.rows[0];
      const now = Date.now();
      
      if (storedCode === code && Number(expires_at) > now) {
          // Code is valid and not expired
          await client.query(
              'DELETE FROM auth_codes WHERE host = $1 AND email = $2',
              [host, email]
          );
          return true;
      }
      
      return false;
  } finally {
      client.release();
  }
}
