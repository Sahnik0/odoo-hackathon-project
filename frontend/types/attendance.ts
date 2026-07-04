export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';
export type AttendanceView = 'daily' | 'weekly' | 'monthly';

export interface AttendanceRecord {
  id: string;
  employeeProfileId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workedMinutes: number | null;
  status: AttendanceStatus;
  note: string | null;
  employeeProfile?: { id: string; firstName: string; lastName: string; department: string | null; loginId: string };
}
