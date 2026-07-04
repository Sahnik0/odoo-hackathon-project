import { z } from 'zod';
import { paginationSchema } from './common';

export const leaveTypeEnum = z.enum(['PAID', 'SICK', 'UNPAID']);
export const leaveStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']);

// Apply for leave (own record). Duration = inclusive calendar days (Section 2).
export const applyLeaveSchema = z
  .object({
    type: leaveTypeEnum,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().min(1).max(500),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

// Admin approve/reject with a comment (Section 8).
export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().trim().max(500).optional(),
});

export const listLeaveSchema = paginationSchema.extend({
  employeeId: z.string().uuid().optional(),
  status: leaveStatusEnum.optional(),
  type: leaveTypeEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
export type ListLeaveQuery = z.infer<typeof listLeaveSchema>;
