import { NextResponse } from 'next/server';
import { setDemoUserCookie } from '@/lib/auth/middleware';

export async function POST() {
  const response = NextResponse.json({ success: true });
  setDemoUserCookie(response, null);
  return response;
}