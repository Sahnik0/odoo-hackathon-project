import { z } from 'zod';
import { paginationSchema } from './common';

// Fields an Employee may edit on their OWN profile (Section 8). Everything else is
// Admin-only, enforced server-side in the service.
export const SELF_EDITABLE_FIELDS = ['phone', 'address', 'profilePicture'] as const;
export const ADMIN_ONLY_FIELDS = [
  'firstName',
  'lastName',
  'department',
  'designation',
  'dateOfJoining',
  'employmentStatus',
] as const;

const phone = z.string().trim().max(20).optional();
const address = z.string().trim().max(300).optional();
const profilePicture = z.string().trim().max(500).optional();
const nameField = z.string().trim().min(1).max(50);

export const employmentStatusEnum = z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']);

// Admin creates an employee account (always EMPLOYEE role).
export const createEmployeeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  firstName: nameField,
  lastName: nameField,
  department: z.string().trim().max(80).optional(),
  designation: z.string().trim().max(80).optional(),
  dateOfJoining: z.coerce.date().optional(),
  phone,
  address,
});

// One update schema (all optional). Role-based field filtering happens in the
// service so an Employee sending an Admin-only field gets an explicit 403.
export const updateEmployeeSchema = z
  .object({
    firstName: nameField.optional(),
    lastName: nameField.optional(),
    phone,
    address,
    profilePicture,
    department: z.string().trim().max(80).optional(),
    designation: z.string().trim().max(80).optional(),
    dateOfJoining: z.coerce.date().optional(),
    employmentStatus: employmentStatusEnum.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

export const listEmployeesSchema = paginationSchema.extend({
  department: z.string().trim().max(80).optional(),
  status: employmentStatusEnum.optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesSchema>;
