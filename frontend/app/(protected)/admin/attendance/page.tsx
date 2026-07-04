'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAttendanceList, useMarkAbsent } from '@/hooks/use-attendance';
import { useEmployeeList } from '@/hooks/use-employees';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface MarkAbsentForm {
  employeeId: string;
  date: string;
  note?: string;
}

export default function AdminAttendancePage() {
  const [page, setPage] = useState(1);
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useAttendanceList({
    page,
    pageSize: 20,
    department: department || undefined,
    status: status || undefined,
  });
  const { data: employees } = useEmployeeList({ pageSize: 100 });
  const markAbsentMutation = useMarkAbsent();

  const { register, handleSubmit, reset } = useForm<MarkAbsentForm>();

  async function onMarkAbsent(values: MarkAbsentForm) {
    try {
      await markAbsentMutation.mutateAsync(values);
      toast.success('Marked absent');
      reset();
      setDialogOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[40px] font-normal text-off-black">Attendance</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">Mark absent ▸</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark an employee absent</DialogTitle>
              <DialogDescription>
                No automatic absence marking runs — use this for employees with no check-in.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onMarkAbsent)}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="employeeId">Employee</Label>
                <Select id="employeeId" {...register('employeeId', { required: true })}>
                  <option value="">Select…</option>
                  {employees?.data.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.loginId})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date', { required: true })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input id="note" {...register('note')} />
              </div>
              <DialogFooter>
                <Button type="submit" variant="primary" disabled={markAbsentMutation.isPending}>
                  {markAbsentMutation.isPending ? 'Saving…' : 'Mark absent'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Filter by department…"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="PRESENT">Present</option>
          <option value="HALF_DAY">Half day</option>
          <option value="ABSENT">Absent</option>
          <option value="LEAVE">Leave</option>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No records" description="Try different filters." />
          ) : (
            <div className="flex flex-col divide-y divide-ash">
              {data.data.map((row) => (
                <div key={row.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[14px] text-off-black">
                      {row.employeeProfile?.firstName} {row.employeeProfile?.lastName}
                    </p>
                    <p className="text-[12px] uppercase text-smoke">
                      {row.employeeProfile?.department ?? '—'} · {new Date(row.date).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                </div>
              ))}
            </div>
          )}
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </CardContent>
      </Card>
    </div>
  );
}
