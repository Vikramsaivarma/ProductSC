'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserProfile {
  email: string;
  full_name: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        setProfile({
          email: data.email,
          full_name: data.full_name,
          role: data.role,
        });
      } catch {
        router.replace('/login');
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, [router]);

  async function handleSignOut() {
    try {
      await fetch('/api/auth/demo-logout', { method: 'POST' });
      toast.success('Signed out');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Sign out failed');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-sm text-foreground">
                  {profile?.full_name || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-sm capitalize text-foreground">{profile?.role}</p>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}