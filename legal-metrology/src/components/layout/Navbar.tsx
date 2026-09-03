'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ScanLine, FileText, Search, Scale } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import UserNav from '@/components/layout/UserNav';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Scan', icon: ScanLine },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/search', label: 'Search', icon: Search },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Legal Metrology</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <UserNav />
      </div>
    </header>
  );
}
