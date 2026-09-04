'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

const DEMO_ACCOUNTS = [
  { email: 'admin@demo.com', role: 'Admin', desc: 'Full access - manage users, view all reports' },
  { email: 'officer@demo.com', role: 'Officer', desc: 'Upload labels, scan products, view own reports' },
  { email: 'viewer@demo.com', role: 'Viewer', desc: 'Read-only access to dashboard and reports' },
];

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function quickLogin(email: string) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'demo123' }),
      });
      if (res.ok) {
        toast.success('Logged in successfully');
        window.location.href = '/dashboard';
      } else {
        toast.error('Login failed');
      }
    } catch {
      toast.error('Login failed');
    }
    setIsLoading(false);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Demo Access</CardTitle>
        <CardDescription>Choose a role to continue (no real signup needed)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DEMO_ACCOUNTS.map((acc) => (
          <Button
            key={acc.email}
            className="w-full justify-start text-left p-4 h-auto gap-4"
            variant="outline"
            onClick={() => quickLogin(acc.email)}
            disabled={isLoading}
          >
            <div className="flex-1">
              <div className="font-medium">{acc.role}</div>
              <div className="text-sm text-muted-foreground">{acc.desc}</div>
              <div className="text-xs font-mono text-muted-foreground mt-1">{acc.email}</div>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        ))}

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-center text-muted-foreground">
          Password for all: <code className="px-1.5 py-0.5 rounded bg-muted">demo123</code>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}