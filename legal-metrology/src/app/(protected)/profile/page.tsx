'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface UserProfile {
  email: string;
  full_name: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setProfile({
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
        role: user.user_metadata?.role ?? 'viewer',
      });
      setIsLoading(false);
    }
    fetchProfile();
  }, [router, supabase]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Signed out');
    router.push('/login');
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
