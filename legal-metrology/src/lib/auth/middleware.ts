import { NextResponse, type NextRequest } from 'next/server';

interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'officer' | 'viewer';
}

const DEMO_USERS: Record<string, DemoUser> = {
  'admin@demo.com': { id: '1', email: 'admin@demo.com', full_name: 'Admin User', role: 'admin' },
  'officer@demo.com': { id: '2', email: 'officer@demo.com', full_name: 'Officer User', role: 'officer' },
  'viewer@demo.com': { id: '3', email: 'viewer@demo.com', full_name: 'Viewer User', role: 'viewer' },
};

export function getDemoUserFromCookie(request: NextRequest): DemoUser | null {
  const cookie = request.cookies.get('demo_user');
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export function setDemoUserCookie(response: NextResponse, user: DemoUser | null) {
  if (user) {
    response.cookies.set('demo_user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
  } else {
    response.cookies.delete('demo_user');
  }
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const user = getDemoUserFromCookie(request);

  const protectedPaths = ['/dashboard', '/upload', '/reports', '/search', '/profile'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export function createDemoUser(email: string, password: string): DemoUser | null {
  const user = DEMO_USERS[email];
  if (user && password === 'demo123') {
    return user;
  }
  return null;
}