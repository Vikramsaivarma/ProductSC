import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getDemoUserFromCookie } from '@/lib/auth/middleware';

export async function GET(request: Request) {
  try {
    const user = getDemoUserFromCookie(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
