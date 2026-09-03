import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-full bg-muted p-8 mb-6">
        <FileQuestion className="h-16 w-16 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
