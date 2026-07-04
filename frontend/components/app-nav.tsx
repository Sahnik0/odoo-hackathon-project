'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const links = user?.role === 'ADMIN' ? ADMIN_LINKS : EMPLOYEE_LINKS;

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <header className="border-b border-ash bg-parchment">
      <div className="mx-auto flex h-20 max-w-[1432px] items-center justify-between px-6">
        <Link href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-[14px] uppercase tracking-tight hover:text-lake-blue',
                pathname === link.href ? 'text-lake-blue' : 'text-off-black',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="hidden text-[14px] text-graphite sm:inline">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
