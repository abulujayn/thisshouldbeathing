import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminSessionCookieName } from '@/lib/admin';

export async function GET() {
  const cookieStore = await cookies();
  const cookieName = await getAdminSessionCookieName();
  const session = cookieStore.get(cookieName);

  if (session?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
