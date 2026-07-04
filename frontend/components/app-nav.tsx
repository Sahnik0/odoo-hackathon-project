'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notification-bell';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const EMPLOYEE_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/attendance', label: 'Attendance' },
  { href: '/leave', label: 'Leave' },
  { href: '/payroll', label: 'Payroll' },
];

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/employees', label: 'Employees' },
  { href: '/admin/attendance', label: 'Attendance' },
  { href: '/admin/leave', label: 'Leave' },
  { href: '/admin/payroll', label: 'Payroll' },
];

export function AppNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = user?.role === 'ADMIN' ? ADMIN_LINKS : EMPLOYEE_LINKS;
  const home = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-parchment/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[var(--page-max-width)] items-center justify-between gap-4 px-6">
        <Link href={home} className="shrink-0">
          <Logo />
        </Link>

        {/* Center nav — a segmented pill with a sliding active indicator. */}
        <nav className="hidden items-center gap-1 rounded-full border border-line bg-surface/70 p-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative rounded-full px-4 py-1.5 text-[13px] font-medium uppercase tracking-tight transition-colors',
                isActive(link.href)
                  ? 'bg-off-black text-white shadow-sm'
                  : 'text-graphite hover:text-off-black',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <span className="hidden max-w-[180px] truncate text-[13px] text-graphite lg:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
            Logout
          </Button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ash text-off-black transition-colors hover:bg-off-black/5 md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'rounded-[14px] px-4 py-2.5 text-[14px] uppercase tracking-tight transition-colors',
                isActive(link.href) ? 'bg-off-black text-white' : 'text-graphite hover:bg-off-black/5',
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 rounded-[14px] px-4 py-2.5 text-left text-[14px] uppercase tracking-tight text-crimson hover:bg-crimson/5"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}
