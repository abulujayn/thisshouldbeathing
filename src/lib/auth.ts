import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { getRedisClient } from './redis';

const JWT_SECRET = process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod';

export async function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

export async function getAuthCodeKey(email: string) {
  const headerList = await headers();
  const host = headerList.get('host') || 'default';
  return `auth:code:${host}:${email}`;
}

export async function storeAuthCode(email: string, code: string) {
  const client = await getRedisClient();
  const key = await getAuthCodeKey(email);
  // Store code with 10 minutes expiration (600 seconds)
  await client.set(key, code, { EX: 600 });
}

export async function verifyAuthCode(email: string, code: string) {
  const client = await getRedisClient();
  const key = await getAuthCodeKey(email);
  const storedCode = await client.get(key);
  
  if (storedCode && storedCode === code) {
    await client.del(key);
    return true;
  }
  return false;
}
