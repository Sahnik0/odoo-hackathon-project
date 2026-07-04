export type LeaveType = 'PAID' | 'SICK' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  employeeProfileId: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  reviewedById: string | null;
  reviewRemarks: string | null;
  reviewedAt: string | null;
  createdAt: string;
  employeeProfile?: { id: string; firstName: string; lastName: string; department: string | null; loginId: string };
}

export interface LeaveBalanceEntry {
  type: LeaveType;
  year: number;
  allocated: number | null;
  used: number;
  remaining: number | null;
}
