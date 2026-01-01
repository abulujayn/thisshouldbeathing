import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';

const ADMIN_DATA_FILE = path.join(process.cwd(), 'admin_data.json');

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

export function getAdminData(): AdminData | null {
  if (!fs.existsSync(ADMIN_DATA_FILE)) {
    return null;
  }
  try {
    const data = fs.readFileSync(ADMIN_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading admin data:', error);
    return null;
  }
}

export function saveAdminData(data: AdminData) {
  fs.writeFileSync(ADMIN_DATA_FILE, JSON.stringify(data, null, 2));
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}
