import { redirect } from 'next/navigation';
import ProductUploader from '@/components/features/upload/ProductUploader';
import { requireAuth } from '@/lib/auth/server';

export default async function UploadPage() {
  const user = await requireAuth();

  if (user.role === 'viewer') {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Scan Product Label
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload images of a packaged commodity label for AI-powered compliance
          analysis.
        </p>
      </div>

      <ProductUploader />
    </div>
  );
}