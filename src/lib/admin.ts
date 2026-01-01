import { cookies, headers } from 'next/headers';
import { getRedisClient } from './redis';

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

async function getAdminKey() {
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  return `${ADMIN_DATA_KEY_PREFIX}:${host}`;
}

export async function getAdminSessionCookieName() {
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  return `admin_session_${host}`;
}

export async function getAdminData(): Promise<AdminData | null> {
  try {
    const client = await getRedisClient();
    const key = await getAdminKey();
    const data = await client.get(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading admin data from Redis:', error);
    return null;
  }
}

export async function saveAdminData(data: AdminData) {
  try {
    const client = await getRedisClient();
    const key = await getAdminKey();
    await client.set(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving admin data to Redis:', error);
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const cookieName = await getAdminSessionCookieName();
  return cookieStore.get(cookieName)?.value === 'authenticated';
}