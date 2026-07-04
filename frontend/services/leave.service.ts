import { api } from '@/lib/axios';
import type { ApiSuccess, ApiMeta } from '@/types/api';
import type { LeaveBalanceEntry, LeaveRequest, LeaveType } from '@/types/leave';

export interface ListLeaveParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  status?: string;
  type?: string;
}

export async function applyLeave(input: { type: LeaveType; startDate: string; endDate: string; reason: string }) {
  const res = await api.post<ApiSuccess<LeaveRequest>>('/leave', input);
  return res.data.data;
}

export async function listMyLeave(params: ListLeaveParams = {}) {
  const res = await api.get<ApiSuccess<LeaveRequest[]>>('/leave/me', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function listLeave(params: ListLeaveParams) {
  const res = await api.get<ApiSuccess<LeaveRequest[]>>('/leave', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function reviewLeave(id: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
  const res = await api.patch<ApiSuccess<LeaveRequest>>(`/leave/${id}/review`, { status, remarks });
  return res.data.data;
}

export async function cancelLeave(id: string) {
  const res = await api.patch<ApiSuccess<LeaveRequest>>(`/leave/${id}/cancel`);
  return res.data.data;
}

export async function getMyLeaveBalance(year?: number) {
  const res = await api.get<ApiSuccess<LeaveBalanceEntry[]>>('/leave/balance/me', { params: { year } });
  return res.data.data;
}
