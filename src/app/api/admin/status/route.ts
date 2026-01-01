import { NextResponse } from 'next/server';
import { getAdminData } from '@/lib/admin';

export async function GET() {
  const adminData = await getAdminData();
  return NextResponse.json({
    isSetup: !!adminData?.credential,
  });
}
