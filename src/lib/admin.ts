import { cookies, headers } from 'next/headers';
import { pool, ensureSchema } from './db';
import type { AuthenticatorTransport } from '@simplewebauthn/server';

const ADMIN_DATA_KEY_PREFIX = 'admin_data';

export interface AdminCredential {
  id: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransport[];
}

export interface AdminData {
  credential?: AdminCredential;
  username: string;
}

// Deprecated logic, but kept for compatibility if referenced elsewhere 
// (though only used internally in getAdminData in Redis version)
async function getAdminKey() {
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  return `${ADMIN_DATA_KEY_PREFIX}:${host}`;
}

async function getHost() {
  const headerList = await headers();
  return headerList.get('host') || 'default';
}

export async function getAdminSessionCookieName() {
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  return `admin_session_${host}`;
}

export async function getAdminData(): Promise<AdminData | null> {
  await ensureSchema();
  const host = await getHost();
  const client = await pool.connect();
  
  try {
    const res = await client.query('SELECT * FROM admin_data WHERE host = $1', [host]);
    if (res.rows.length === 0) return null;
    
    const row = res.rows[0];
    
    let credential: AdminCredential | undefined;
    
    if (row.credential_id && row.credential_public_key) {
        let transports: AuthenticatorTransport[] | undefined;
        if (row.credential_transports) {
            try {
                transports = JSON.parse(row.credential_transports);
            } catch (e) {
                console.error("Failed to parse transports", e);
            }
        }
        
        credential = {
            id: row.credential_id,
            publicKey: row.credential_public_key,
            counter: row.credential_counter || 0,
            transports
        };
    }
    
    return {
        username: row.username,
        credential
    };
  } catch (error) {
    console.error('Error reading admin data from DB:', error);
    return null;
  } finally {
      client.release();
  }
}

export async function saveAdminData(data: AdminData) {
  await ensureSchema();
  const host = await getHost();
  const client = await pool.connect();
  
  try {
    const cred = data.credential;
    const transports = cred?.transports ? JSON.stringify(cred.transports) : null;
    
    await client.query(
        `INSERT INTO admin_data (
            host, username, credential_id, credential_public_key, credential_counter, credential_transports
         ) VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (host) DO UPDATE SET
            username = EXCLUDED.username,
            credential_id = EXCLUDED.credential_id,
            credential_public_key = EXCLUDED.credential_public_key,
            credential_counter = EXCLUDED.credential_counter,
            credential_transports = EXCLUDED.credential_transports
        `,
        [
            host, 
            data.username, 
            cred?.id || null, 
            cred?.publicKey || null, 
            cred?.counter || 0, 
            transports
        ]
    );
  } catch (error) {
    console.error('Error saving admin data to DB:', error);
  } finally {
      client.release();
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const cookieName = await getAdminSessionCookieName();
  return cookieStore.get(cookieName)?.value === 'authenticated';
}