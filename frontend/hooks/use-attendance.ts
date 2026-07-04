import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  listAttendance,
  markAbsent,
  type ListAttendanceParams,
} from '@/services/attendance.service';
import type { AttendanceView } from '@/types/attendance';

export const attendanceKeys = {
  all: ['attendance'] as const,
  mine: (view: AttendanceView) => [...attendanceKeys.all, 'me', view] as const,
  list: (params: ListAttendanceParams) => [...attendanceKeys.all, 'list', params] as const,
};

export function useMyAttendance(view: AttendanceView) {
  return useQuery({ queryKey: attendanceKeys.mine(view), queryFn: () => getMyAttendance(view) });
}

export function useAttendanceList(params: ListAttendanceParams) {
  return useQuery({ queryKey: attendanceKeys.list(params), queryFn: () => listAttendance(params) });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}

export function useMarkAbsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, date, note }: { employeeId: string; date: string; note?: string }) =>
      markAbsent(employeeId, date, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  });
}
