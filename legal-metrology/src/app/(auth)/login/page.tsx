'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type EmailPasswordValues = {
  email: string;
  password: string;
};

type MagicLinkValues = {
  email: string;
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const emailPasswordForm = useForm<EmailPasswordValues>({
    defaultValues: { email: '', password: '' },
  });

  const magicLinkForm = useForm<MagicLinkValues>({
    defaultValues: { email: '' },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleEmailPassword(data: EmailPasswordValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setIsLoading(false);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        toast.error('Too many login attempts. Please wait a moment before trying again.');
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success('Signed in successfully');
    router.push('/dashboard');
    router.refresh();
  }

  async function handleMagicLink(data: MagicLinkValues) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsLoading(false);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
        toast.error('Too many requests. Please wait a moment before trying again.');
      } else {
        toast.error(error.message);
      }
      return;
    }

    toast.success('Check your email for the login link');
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Email & Password</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form
              onSubmit={emailPasswordForm.handleSubmit(handleEmailPassword)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...emailPasswordForm.register('email', {
                      required: 'Email is required',
                    })}
                  />
                </div>
                {emailPasswordForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {emailPasswordForm.formState.errors.email.message}
                  </p>
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
                    {...emailPasswordForm.register('password', {
                      required: 'Password is required',
                    })}
                  />
                </div>
                {emailPasswordForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {emailPasswordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic-link">
            <form
              onSubmit={magicLinkForm.handleSubmit(handleMagicLink)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="magic-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...magicLinkForm.register('email', {
                      required: 'Email is required',
                    })}
                  />
                </div>
                {magicLinkForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {magicLinkForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                We&apos;ll send you a magic link to sign in without a password.
              </p>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send Magic Link
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
