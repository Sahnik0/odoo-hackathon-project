'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMyAttendance, useCheckIn, useCheckOut } from '@/hooks/use-attendance';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import type { AttendanceView } from '@/types/attendance';

function formatTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatHours(minutes: number | null) {
  if (minutes === null) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export default function AttendancePage() {
  const [view, setView] = useState<AttendanceView>('daily');
  const { data, isLoading } = useMyAttendance(view);
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const today = new Date().toISOString().slice(0, 10);
  const todayRow = data?.data.find((r) => r.date.slice(0, 10) === today);

  async function handleCheckIn() {
    try {
      await checkInMutation.mutateAsync();
      toast.success('Checked in');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCheckOut() {
    try {
      await checkOutMutation.mutateAsync();
      toast.success('Checked out');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[40px] font-normal text-off-black">Attendance</h1>
        <p className="mt-2 text-[14px] text-graphite">Check in and out, and review your history.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] uppercase text-smoke">Check-in</span>
            <span className="text-[20px] text-off-black">{formatTime(todayRow?.checkIn ?? null)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] uppercase text-smoke">Check-out</span>
            <span className="text-[20px] text-off-black">{formatTime(todayRow?.checkOut ?? null)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] uppercase text-smoke">Worked</span>
            <span className="text-[20px] text-off-black">{formatHours(todayRow?.workedMinutes ?? null)}</span>
          </div>
          {todayRow && (
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase text-smoke">Status</span>
              <StatusBadge status={todayRow.status} />
            </div>
          )}
          <div className="ml-auto flex gap-3">
            <Button
              variant="primary"
              onClick={handleCheckIn}
              disabled={!!todayRow?.checkIn || checkInMutation.isPending}
            >
              {checkInMutation.isPending ? 'Checking in…' : 'Check in'}
            </Button>
            <Button
              variant="default"
              onClick={handleCheckOut}
              disabled={!todayRow?.checkIn || !!todayRow?.checkOut || checkOutMutation.isPending}
            >
              {checkOutMutation.isPending ? 'Checking out…' : 'Check out'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>History</CardTitle>
          <Select value={view} onChange={(e) => setView(e.target.value as AttendanceView)}>
            <option value="daily">Today</option>
            <option value="weekly">This week</option>
            <option value="monthly">This month</option>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No records" description="Nothing checked in for this period yet." />
          ) : (
            <div className="flex flex-col divide-y divide-ash">
              {data.data.map((row) => (
                <div key={row.id} className="flex items-center justify-between py-3">
                  <span className="text-[14px] text-off-black">
                    {new Date(row.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-[14px] text-graphite">
                    {formatTime(row.checkIn)} – {formatTime(row.checkOut)}
                  </span>
                  <span className="text-[14px] text-graphite">{formatHours(row.workedMinutes)}</span>
                  <StatusBadge status={row.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
