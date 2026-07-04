import { z } from 'zod';

// Mirrors backend/src/validators/employee.validators.ts.
export const SELF_EDITABLE_FIELDS = ['phone', 'address', 'profilePicture'] as const;
export const ADMIN_ONLY_FIELDS = [
  'firstName',
  'lastName',
  'department',
  'designation',
  'dateOfJoining',
  'employmentStatus',
] as const;

const nameField = z.string().trim().min(1, 'Required').max(50, 'Too long');
export const employmentStatusEnum = z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']);

export const selfEditSchema = z.object({
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
});

export const adminEditSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  department: z.string().trim().max(80).optional().or(z.literal('')),
  designation: z.string().trim().max(80).optional().or(z.literal('')),
  dateOfJoining: z.string().min(1, 'Required'),
  employmentStatus: employmentStatusEnum,
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  address: z.string().trim().max(300).optional().or(z.literal('')),
});

export const createEmployeeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email format'),
  firstName: nameField,
  lastName: nameField,
  department: z.string().trim().max(80).optional().or(z.literal('')),
  designation: z.string().trim().max(80).optional().or(z.literal('')),
});

export type SelfEditInput = z.infer<typeof selfEditSchema>;
export type AdminEditInput = z.infer<typeof adminEditSchema>;
export type CreateEmployeeFormInput = z.infer<typeof createEmployeeSchema>;
