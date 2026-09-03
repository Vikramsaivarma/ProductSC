import { Scale } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Legal Metrology
          </h1>
          <p className="text-sm text-muted-foreground">
            Compliance Checker
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
