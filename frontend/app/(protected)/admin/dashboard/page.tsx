'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Phase 3 delivers the auth shell only — feature cards below are placeholders
// wired up for real in their own vertical slices (Phase 4-8, see TASK.md).
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, router]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[40px] font-normal text-off-black">Admin dashboard</h1>
        <p className="mt-2 text-[16px] text-graphite">{user?.email}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Manage employee accounts and profiles</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Review records across all employees</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave Approvals</CardTitle>
            <CardDescription>Approve or reject pending requests</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
