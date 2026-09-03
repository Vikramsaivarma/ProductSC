import { Providers } from './providers';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Providers>{children}</Providers>
    </div>
  );
}
