'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CalendarDays } from 'lucide-react';
import { useApplyLeave, useCancelLeave, useMyLeave, useMyLeaveBalance } from '@/hooks/use-leave';
import { useMyAttendance } from '@/hooks/use-attendance';
import { applyLeaveSchema, type ApplyLeaveFormInput } from '@/schemas/leave';
import { apiErrorMessage } from '@/lib/axios';
import { isoToDateKey, keyToDate } from '@/lib/date';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton, Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Calendar, CalendarLegend, type CalendarMarkerTone } from '@/components/ui/calendar';

const LEAVE_LABELS: Record<string, string> = { PAID: 'Paid', SICK: 'Sick', UNPAID: 'Unpaid' };

function countDays(start: string, end: string) {
  const s = keyToDate(start).getTime();
  const e = keyToDate(end).getTime();
  return Math.round((e - s) / 86_400_000) + 1;
}

export default function LeavePage() {
  const { data: balances, isLoading: balanceLoading } = useMyLeaveBalance();
  const { data: leaveList, isLoading: listLoading } = useMyLeave();
  const { data: attendance } = useMyAttendance('monthly');
  const applyMutation = useApplyLeave();
  const cancelMutation = useCancelLeave();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApplyLeaveFormInput>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: { type: 'PAID', startDate: '', endDate: '', reason: '' },
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const today = isoToDateKey(new Date().toISOString());

  // Merge attendance status + approved leave into calendar markers.
  const markers = useMemo(() => {
    const m: Record<string, CalendarMarkerTone> = {};
    for (const rec of attendance?.data ?? []) {
      const key = isoToDateKey(rec.date);
      m[key] =
        rec.status === 'PRESENT'
          ? 'present'
          : rec.status === 'ABSENT'
            ? 'absent'
            : rec.status === 'HALF_DAY'
              ? 'half'
              : 'leave';
    }
    return m;
  }, [attendance]);

  const selectedDays = startDate && endDate ? countDays(startDate, endDate) : startDate ? 1 : 0;

  async function onApply(values: ApplyLeaveFormInput) {
    try {
      await applyMutation.mutateAsync(values);
      toast.success('Leave request submitted');
      reset({ type: values.type, startDate: '', endDate: '', reason: '' });
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelMutation.mutateAsync(id);
      toast.success('Leave request cancelled');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">Leave</h1>
        <p className="mt-1.5 text-[15px] text-graphite">Apply for time off and track your balance.</p>
      </div>

      {/* Balance stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {balanceLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          balances?.map((b) => (
            <Card key={b.type} className="p-6">
              <span className="text-[12px] uppercase tracking-[0.04em] text-smoke">{LEAVE_LABELS[b.type]} leave</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-[34px] font-normal tracking-tight text-off-black">
                  {b.remaining === null ? '∞' : b.remaining}
                </span>
                <span className="text-[13px] text-graphite">left</span>
              </div>
              <span className="mt-1 block text-[12px] text-graphite">
                {b.used} used {b.allocated !== null && `· ${b.allocated} allocated`}
              </span>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Calendar picker + apply form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Apply for leave</CardTitle>
            <CardDescription>Select a date range on the calendar, then add the details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit(onApply)}>
              <div className="rounded-[18px] border border-line bg-surface-raised p-4">
                <Calendar
                  minDate={today}
                  selectedRange={{ start: startDate || null, end: endDate || null }}
                  onSelectRange={(r) => {
                    setValue('startDate', r.start ?? '', { shouldValidate: true });
                    setValue('endDate', r.end ?? r.start ?? '', { shouldValidate: true });
                  }}
                />
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[13px]">
                  <span className="flex items-center gap-1.5 text-graphite">
                    <CalendarDays size={15} />
                    {startDate ? (
                      <span className="text-off-black">
                        {keyToDate(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {endDate && endDate !== startDate && (
                          <> – {keyToDate(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</>
                        )}
                      </span>
                    ) : (
                      <span className="text-smoke">No dates selected</span>
                    )}
                  </span>
                  {selectedDays > 0 && (
                    <span className="rounded-full bg-off-black/[0.05] px-2.5 py-1 text-[12px] font-medium text-off-black">
                      {selectedDays} day{selectedDays > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <FieldError message={errors.startDate?.message ?? errors.endDate?.message} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="type">Leave type</Label>
                  <Select id="type" {...register('type')}>
                    <option value="PAID">Paid</option>
                    <option value="SICK">Sick</option>
                    <option value="UNPAID">Unpaid</option>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Add a short note for your manager…" {...register('reason')} />
                <FieldError message={errors.reason?.message} />
              </div>

              <Button type="submit" variant="primary" disabled={applyMutation.isPending} className="w-full sm:w-fit">
                {applyMutation.isPending ? 'Submitting…' : 'Submit request ▸'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Monthly attendance snapshot */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This month</CardTitle>
            <CardDescription>Your attendance at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-[18px] border border-line bg-surface-raised p-4">
              <Calendar markers={markers} />
            </div>
            <CalendarLegend
              items={[
                { tone: 'present', label: 'Present' },
                { tone: 'absent', label: 'Absent' },
                { tone: 'half', label: 'Half-day' },
                { tone: 'leave', label: 'Leave' },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Request history */}
      <Card>
        <CardHeader>
          <CardTitle>My requests</CardTitle>
          <CardDescription>Cancel a pending request, or an approved one before it starts.</CardDescription>
        </CardHeader>
        <CardContent>
          {listLoading ? (
            <TableSkeleton />
          ) : !leaveList || leaveList.data.length === 0 ? (
            <EmptyState title="No leave requests yet" description="Your submitted requests will appear here." icon={CalendarDays} />
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {leaveList.data.map((req) => {
                const canCancel =
                  req.status === 'PENDING' || (req.status === 'APPROVED' && new Date(req.startDate) > new Date());
                return (
                  <div key={req.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex-1">
                      <p className="text-[14px] text-off-black">
                        {LEAVE_LABELS[req.type]} · {new Date(req.startDate).toLocaleDateString()} –{' '}
                        {new Date(req.endDate).toLocaleDateString()}{' '}
                        <span className="text-graphite">({req.days}d)</span>
                      </p>
                      <p className="mt-0.5 text-[13px] text-graphite">{req.reason}</p>
                      {req.reviewRemarks && (
                        <p className="mt-0.5 text-[12px] italic text-smoke">Admin: {req.reviewRemarks}</p>
                      )}
                    </div>
                    <StatusBadge status={req.status} />
                    {canCancel && (
                      <ConfirmDialog
                        trigger={
                          <Button variant="ghost" size="sm">
                            Cancel
                          </Button>
                        }
                        title="Cancel this leave request?"
                        description="If it was already approved, your balance will be restored."
                        confirmLabel="Cancel request"
                        onConfirm={() => handleCancel(req.id)}
                        isPending={cancelMutation.isPending}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
