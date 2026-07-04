'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Phase 3 delivers the auth shell only — feature cards below are placeholders
// wired up for real in their own vertical slices (Phase 4-8, see TASK.md).
export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'ADMIN') router.replace('/admin/dashboard');
  }, [user, router]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[40px] font-normal text-off-black">Welcome back</h1>
        <p className="mt-2 text-[16px] text-graphite">{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>View and edit your details</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Check in / check out</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>Apply and track status</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payroll</CardTitle>
            <CardDescription>View your payslips</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
