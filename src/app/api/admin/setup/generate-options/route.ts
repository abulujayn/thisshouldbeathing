import { NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getAdminData } from '@/lib/admin';

export async function POST(req: Request) {
  const adminData = await getAdminData();
  
  // If already setup, don't allow re-setup without auth (simplified)
  if (adminData?.credential) {
    return NextResponse.json({ error: 'Admin already setup' }, { status: 400 });
  }

  const rpName = 'Why Doesn\'t This Exist';
  const host = req.headers.get('host') || 'localhost';
  let rpID = host.split(':')[0];
  
  if (rpID === '127.0.0.1') {
    rpID = 'localhost';
  }

  const userID = Uint8Array.from('admin-user', c => c.charCodeAt(0));
  const userName = 'admin';

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userID,
    userName,
    userDisplayName: 'admin',
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  const response = NextResponse.json(options);
  response.cookies.set('reg_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
  });

  return response;
}
