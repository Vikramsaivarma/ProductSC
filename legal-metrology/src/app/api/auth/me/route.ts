import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getDemoUserFromCookie } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  const user = getDemoUserFromCookie(request as NextRequest);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(user);
}