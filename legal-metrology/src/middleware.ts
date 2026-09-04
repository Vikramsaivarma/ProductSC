import { updateSession } from '@/lib/auth/middleware';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/reports/:path*',
    '/search/:path*',
    '/profile/:path*',
  ],
};