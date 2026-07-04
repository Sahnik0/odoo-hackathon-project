import { z } from 'zod';
import { paginationSchema } from './common';

// Money in rupees over the wire; converted to integer paise in the service
// (Section 2 — never store floats).
const rupees = z.coerce.number().nonnegative().multipleOf(0.01);

export const upsertSalaryStructureSchema = z.object({
  basic: rupees,
  hra: rupees,
  allowances: rupees.default(0),
  deductions: rupees.default(0),
  effectiveFrom: z.coerce.date().optional(),
});

export const generatePayrollSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const listPayrollSchema = paginationSchema.extend({
  employeeId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type UpsertSalaryStructureInput = z.infer<typeof upsertSalaryStructureSchema>;
export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type ListPayrollQuery = z.infer<typeof listPayrollSchema>;
