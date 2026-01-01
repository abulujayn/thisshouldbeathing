import { cookies } from 'next/headers';
import { getRedisClient } from './redis';

const ADMIN_DATA_KEY = 'admin_data';

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

export async function getAdminData(): Promise<AdminData | null> {
  try {
    const client = await getRedisClient();
    const data = await client.get(ADMIN_DATA_KEY);
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
    await client.set(ADMIN_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving admin data to Redis:', error);
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}