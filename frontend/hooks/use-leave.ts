import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  applyLeave,
  cancelLeave,
  getMyLeaveBalance,
  listLeave,
  listMyLeave,
  reviewLeave,
  type ListLeaveParams,
} from '@/services/leave.service';
import type { LeaveType } from '@/types/leave';

export const leaveKeys = {
  all: ['leave'] as const,
  mine: (params: ListLeaveParams) => [...leaveKeys.all, 'me', params] as const,
  list: (params: ListLeaveParams) => [...leaveKeys.all, 'list', params] as const,
  balance: () => [...leaveKeys.all, 'balance'] as const,
};

export function useMyLeave(params: ListLeaveParams = {}) {
  return useQuery({ queryKey: leaveKeys.mine(params), queryFn: () => listMyLeave(params) });
}

export function useLeaveList(params: ListLeaveParams) {
  return useQuery({ queryKey: leaveKeys.list(params), queryFn: () => listLeave(params) });
}

export function useMyLeaveBalance() {
  return useQuery({ queryKey: leaveKeys.balance(), queryFn: () => getMyLeaveBalance() });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: LeaveType; startDate: string; endDate: string; reason: string }) =>
      applyLeave(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export function useReviewLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      reviewLeave(id, status, remarks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelLeave(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leaveKeys.all }),
  });
}
