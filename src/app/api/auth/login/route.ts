import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { storeAuthCode } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await storeAuthCode(email, code);

    // Send email
    const { error } = await resend.emails.send({
      from: process.env.SYSTEM_EMAIL || 'This should be a thing <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Verification Code',
      html: `<p>Your verification code is: <strong>${code}</strong></p><p>It will expire in 10 minutes.</p>`,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
