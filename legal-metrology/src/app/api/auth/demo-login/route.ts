import { NextResponse } from 'next/server';
import { createDemoUser, setDemoUserCookie } from '@/lib/auth/middleware';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = createDemoUser(email, password);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ user });
    setDemoUserCookie(response, user);
    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}