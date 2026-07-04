import { z } from 'zod';
import { paginationSchema } from './common';

export const attendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE']);

export const viewQuerySchema = z.object({
  view: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

export const listAttendanceSchema = paginationSchema.extend({
  employeeId: z.string().uuid().optional(),
  department: z.string().trim().max(80).optional(),
  status: attendanceStatusEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const markAbsentSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.coerce.date(),
  note: z.string().trim().max(200).optional(),
});

export type ListAttendanceQuery = z.infer<typeof listAttendanceSchema>;
export type MarkAbsentInput = z.infer<typeof markAbsentSchema>;
export type ViewQuery = z.infer<typeof viewQuerySchema>;
