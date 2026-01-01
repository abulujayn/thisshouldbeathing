import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { getAdminData, saveAdminData, getAdminSessionCookieName } from '@/lib/admin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json();
  const adminData = await getAdminData();
  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get('auth_challenge')?.value;

  if (!adminData || !adminData.credential) {
    return NextResponse.json({ error: 'Admin not setup' }, { status: 400 });
  }

  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 400 });
  }

  const origin = req.headers.get('origin') || 'http://localhost:3000';
  const url = new URL(origin);
  let rpID = url.hostname;

  if (rpID === '127.0.0.1') {
    rpID = 'localhost';
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: adminData!.credential!.id,
        publicKey: new Uint8Array(Buffer.from(adminData!.credential!.publicKey, 'base64url')),
        counter: adminData!.credential!.counter,
        transports: adminData!.credential!.transports,
      },
    });

    if (verification.verified && verification.authenticationInfo) {
      // Update counter
      if (adminData && adminData.credential) {
        adminData.credential.counter = verification.authenticationInfo.newCounter;
        await saveAdminData(adminData);
      }

      const response = NextResponse.json({ verified: true });
      const cookieName = await getAdminSessionCookieName();
      response.cookies.set(cookieName, 'authenticated', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      response.cookies.set('auth_challenge', '', { maxAge: 0, path: '/' });
      
      return response;
    } else {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Verification Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
