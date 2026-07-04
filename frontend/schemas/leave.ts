import { z } from 'zod';

export const applyLeaveSchema = z
  .object({
    type: z.enum(['PAID', 'SICK', 'UNPAID']),
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
    reason: z.string().trim().min(1, 'Required').max(500),
  })
  .refine((v) => v.endDate >= v.startDate, { message: 'End date must be on or after start date', path: ['endDate'] });

export type ApplyLeaveFormInput = z.infer<typeof applyLeaveSchema>;
