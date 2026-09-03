'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-destructive/10 p-8 mb-6">
        <AlertTriangle className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <code className="mt-4 rounded bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          Error ID: {error.digest}
        </code>
      )}
      <Button onClick={reset} className="mt-6">
        Try Again
      </Button>
    </div>
  );
}
