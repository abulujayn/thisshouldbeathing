import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getAdminData } from '@/lib/admin';

export async function POST(req: Request) {
  const adminData = getAdminData();
  
  if (!adminData || !adminData.credential) {
    return NextResponse.json({ error: 'Admin not setup' }, { status: 400 });
  }

  const host = req.headers.get('host') || 'localhost';
  let rpID = host.split(':')[0];
  
  if (rpID === '127.0.0.1') {
    rpID = 'localhost';
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [],
    userVerification: 'preferred',
  });

  const response = NextResponse.json(options);
  response.cookies.set('auth_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });

  return response;
}
