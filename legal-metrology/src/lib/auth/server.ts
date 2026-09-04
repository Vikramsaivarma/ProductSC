import { cookies } from 'next/headers';

interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'officer' | 'viewer';
}

export async function getDemoUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('demo_user');
  if (!cookie) return null;
  try {
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<DemoUser> {
  const user = await getDemoUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}