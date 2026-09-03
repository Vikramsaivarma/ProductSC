'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, ArrowRight, Loader2, Scale, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SignupValues = {
  full_name: string;
  email: string;
  password: string;
  invite_code?: string;
};

const INVITE_CODES: { code: string; role: string }[] = [
  { code: 'LMADMIN2025', role: 'admin' },
  { code: 'LMOFFICER2025', role: 'officer' },
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupValues>({
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      invite_code: '',
    },
  });

  async function handleSignup(data: SignupValues) {
    setIsLoading(true);

    const matchedCode = INVITE_CODES.find(
      (c) => c.code === data.invite_code?.trim().toUpperCase()
    );
    const role = matchedCode ? matchedCode.role : 'viewer';

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          role,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Account created! Check your email to confirm.');
    router.push('/login');
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Get started with Legal Metrology Checker</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-name"
                type="text"
                placeholder="Jane Doe"
                className="pl-10"
                {...form.register('full_name', {
                  required: 'Full name is required',
                })}
              />
            </div>
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...form.register('email', {
                  required: 'Email is required',
                })}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...form.register('password', {
                  required: 'Password is required',
                })}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-invite">Invite Code (optional)</Label>
            <div className="relative">
              <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-invite"
                type="text"
                placeholder="Enter invite code"
                className="pl-10"
                {...form.register('invite_code')}
              />
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                <Info className="h-3.5 w-3.5" />
                Available invite codes
              </div>
              <ul className="space-y-1">
                <li>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">LMADMIN2025</code>
                  {' '}→ Admin
                </li>
                <li>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">LMOFFICER2025</code>
                  {' '}→ Officer
                </li>
                <li>
                  No code → Viewer
                </li>
              </ul>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
