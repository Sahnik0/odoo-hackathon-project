'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useLeaveList, useReviewLeave } from '@/hooks/use-leave';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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

export default function AdminLeavePage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const { data, isLoading } = useLeaveList({ page, pageSize: 20, status: status || undefined });
  const reviewMutation = useReviewLeave();

  async function handleReview(id: string, decision: 'APPROVED' | 'REJECTED', remarks: string) {
    try {
      await reviewMutation.mutateAsync({ id, status: decision, remarks: remarks || undefined });
      toast.success(`Leave ${decision.toLowerCase()}`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">Leave approvals</h1>
        <p className="mt-1.5 text-[15px] text-graphite">Review, approve or reject time-off requests.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[18px] border border-line bg-surface p-3">
        <span className="pl-1 text-[12px] uppercase tracking-[0.04em] text-smoke">Filter</span>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-fit"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="">All</option>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="Nothing to review" description="No requests match this filter." />
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {data.data.map((req) => (
                <ReviewRow key={req.id} request={req} onReview={handleReview} isPending={reviewMutation.isPending} />
              ))}
            </div>
          )}
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewRow({
  request,
  onReview,
  isPending,
}: {
  request: import('@/types/leave').LeaveRequest;
  onReview: (id: string, decision: 'APPROVED' | 'REJECTED', remarks: string) => void;
  isPending: boolean;
}) {
  const [remarks, setRemarks] = useState('');
  const [open, setOpen] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  function openWith(d: 'APPROVED' | 'REJECTED') {
    setDecision(d);
    setOpen(true);
  }

  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="flex-1">
        <p className="text-[14px] text-off-black">
          {request.employeeProfile?.firstName} {request.employeeProfile?.lastName} · {request.type} ·{' '}
          {new Date(request.startDate).toLocaleDateString()} – {new Date(request.endDate).toLocaleDateString()} (
          {request.days}d)
        </p>
        <p className="text-[12px] text-graphite">{request.reason}</p>
      </div>
      <StatusBadge status={request.status} />
      {request.status === 'PENDING' && (
        <Dialog open={open} onOpenChange={setOpen}>
          <div className="flex gap-2">
            <DialogTrigger asChild>
              <Button size="sm" variant="default" onClick={() => openWith('APPROVED')}>
                Approve
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive" onClick={() => openWith('REJECTED')}>
                Reject
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{decision === 'APPROVED' ? 'Approve' : 'Reject'} this request?</DialogTitle>
              <DialogDescription>Add an optional comment — the employee will see it.</DialogDescription>
            </DialogHeader>
            <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Comment (optional)" />
            <DialogFooter>
              <Button
                variant={decision === 'APPROVED' ? 'primary' : 'destructive'}
                disabled={isPending}
                onClick={() => onReview(request.id, decision, remarks)}
              >
                {isPending ? 'Saving…' : `Confirm ${decision === 'APPROVED' ? 'approval' : 'rejection'}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
