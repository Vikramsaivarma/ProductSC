import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Legal Metrology Compliance Checker',
  description: 'AI-powered compliance verification for packaged commodities under Legal Metrology Rules 2011',
  keywords: ['legal metrology', 'compliance', 'packaged commodities', 'MRP', 'net quantity', 'consumer protection'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}