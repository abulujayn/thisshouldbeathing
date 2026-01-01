import { NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { saveAdminData, AdminData } from '@/lib/admin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json();
  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get('reg_challenge')?.value;

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
    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { id, publicKey, counter } = credential;

      const adminData: AdminData = {
        username: 'admin',
        credential: {
          id: Buffer.from(id).toString('base64url'),
          publicKey: Buffer.from(publicKey).toString('base64url'),
          counter,
          transports: body.response.transports,
        },
      };

      await saveAdminData(adminData);
      
      const response = NextResponse.json({ verified: true });
      response.cookies.set('admin_session', 'authenticated', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });
      response.cookies.set('reg_challenge', '', { maxAge: 0, path: '/' });
      
      return response;
    } else {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
