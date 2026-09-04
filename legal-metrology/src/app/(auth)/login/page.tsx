'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, Loader2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth/demo-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const dynamic = 'force-dynamic';

type LoginValues = {
  email: string;
  password: string;
};

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.com', role: 'Admin', desc: 'Full access' },
  { email: 'officer@demo.com', role: 'Officer', desc: 'Upload & scan' },
  { email: 'viewer@demo.com', role: 'Viewer', desc: 'Read-only' },
];

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    defaultValues: { email: 'admin@demo.com', password: 'demo123' },
  });

  async function handleLogin(data: LoginValues) {
    setIsLoading(true);
    const ok = await login(data.email, data.password);
    setIsLoading(false);
    if (!ok) {
      toast.error('Invalid credentials. Use demo accounts below.');
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...form.register('email', { required: 'Email is required' })}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...form.register('password', { required: 'Password is required' })}
              />
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
            {isLoading || authLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Users className="h-4 w-4" />
            Demo Accounts (password: <code className="px-1.5 py-0.5 rounded bg-muted">demo123</code>)
          </div>
          <ul className="space-y-2 text-sm">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  form.setValue('email', acc.email);
                  form.setValue('password', 'demo123');
                }}>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded w-40">{acc.email}</span>
                <span className="font-medium">{acc.role}</span>
                <span className="text-muted-foreground">- {acc.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}