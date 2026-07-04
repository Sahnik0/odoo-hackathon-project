'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useApplyLeave, useCancelLeave, useMyLeave, useMyLeaveBalance } from '@/hooks/use-leave';
import { applyLeaveSchema, type ApplyLeaveFormInput } from '@/schemas/leave';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton, Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function LeavePage() {
  const { data: balances, isLoading: balanceLoading } = useMyLeaveBalance();
  const { data: leaveList, isLoading: listLoading } = useMyLeave();
  const applyMutation = useApplyLeave();
  const cancelMutation = useCancelLeave();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormInput>({ resolver: zodResolver(applyLeaveSchema) });

  async function onApply(values: ApplyLeaveFormInput) {
    try {
      await applyMutation.mutateAsync(values);
      toast.success('Leave request submitted');
      reset();
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
        <h1 className="font-serif text-[40px] font-normal text-off-black">Leave</h1>
        <p className="mt-2 text-[14px] text-graphite">Apply for leave and track your balance.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {balanceLoading ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          balances?.map((b) => (
            <Card key={b.type}>
              <CardContent className="flex flex-col gap-1 py-2">
                <span className="text-[12px] uppercase text-smoke">{b.type} leave</span>
                <span className="font-serif text-[32px] font-normal text-off-black">
                  {b.remaining === null ? '∞' : b.remaining}
                </span>
                <span className="text-[12px] text-graphite">
                  {b.used} used {b.allocated !== null && `of ${b.allocated}`}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Apply for leave</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onApply)}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="type">Type</Label>
                <Select id="type" {...register('type')}>
                  <option value="PAID">Paid</option>
                  <option value="SICK">Sick</option>
                  <option value="UNPAID">Unpaid</option>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
                <FieldError message={errors.startDate?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" {...register('endDate')} />
                <FieldError message={errors.endDate?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" {...register('reason')} />
                <FieldError message={errors.reason?.message} />
              </div>
              <Button type="submit" variant="primary" disabled={applyMutation.isPending} className="w-full">
                {applyMutation.isPending ? 'Submitting…' : 'Submit request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My requests</CardTitle>
            <CardDescription>Cancel a pending request, or an approved one before it starts.</CardDescription>
          </CardHeader>
          <CardContent>
            {listLoading ? (
              <TableSkeleton />
            ) : !leaveList || leaveList.data.length === 0 ? (
              <EmptyState title="No leave requests yet" />
            ) : (
              <div className="flex flex-col divide-y divide-ash">
                {leaveList.data.map((req) => {
                  const canCancel =
                    req.status === 'PENDING' || (req.status === 'APPROVED' && new Date(req.startDate) > new Date());
                  return (
                    <div key={req.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="flex-1">
                        <p className="text-[14px] text-off-black">
                          {req.type} · {new Date(req.startDate).toLocaleDateString()} –{' '}
                          {new Date(req.endDate).toLocaleDateString()} ({req.days}d)
                        </p>
                        <p className="text-[12px] text-graphite">{req.reason}</p>
                        {req.reviewRemarks && (
                          <p className="text-[12px] italic text-smoke">Admin: {req.reviewRemarks}</p>
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
    </div>
  );
}
