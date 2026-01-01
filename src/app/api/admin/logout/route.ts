import { NextResponse } from 'next/server';
import { getAdminSessionCookieName } from '@/lib/admin';

export async function POST() {
  const response = NextResponse.json({ success: true });
  const cookieName = await getAdminSessionCookieName();
  response.cookies.set(cookieName, '', { maxAge: 0 });
  return response;
}
