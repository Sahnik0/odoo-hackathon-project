import { api } from '@/lib/axios';
import type { ApiSuccess, ApiMeta } from '@/types/api';
import type { AttendanceRecord, AttendanceView } from '@/types/attendance';

export interface ListAttendanceParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  department?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function checkIn() {
  const res = await api.post<ApiSuccess<AttendanceRecord>>('/attendance/check-in');
  return res.data.data;
}

export async function checkOut() {
  const res = await api.post<ApiSuccess<AttendanceRecord>>('/attendance/check-out');
  return res.data.data;
}

export async function getMyAttendance(view: AttendanceView) {
  const res = await api.get<ApiSuccess<{ data: AttendanceRecord[]; view: AttendanceView; range: { from: string; to: string } }>>(
    '/attendance/me',
    { params: { view } },
  );
  return res.data.data;
}

export async function listAttendance(params: ListAttendanceParams) {
  const res = await api.get<ApiSuccess<AttendanceRecord[]>>('/attendance', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function markAbsent(employeeId: string, date: string, note?: string) {
  const res = await api.post<ApiSuccess<AttendanceRecord>>('/attendance/mark-absent', {
    employeeId,
    date,
    note,
  });
  return res.data.data;
}
