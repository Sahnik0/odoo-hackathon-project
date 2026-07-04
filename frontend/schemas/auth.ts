import { z } from 'zod';

// Mirrors backend/src/validators/auth.validators.ts field-for-field
// (Section 4 / 9 — kept in sync manually, separate deployables).

const email = z.string().trim().toLowerCase().email('Invalid email format');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const name = z.string().trim().min(1, 'Required').max(50, 'Too long');

export const registerSchema = z
  .object({
    companyName: z.string().trim().min(1, 'Company name is required').max(100, 'Too long'),
    firstName: name,
    lastName: name,
    email,
    phone: z.string().trim().min(10, 'Enter a valid phone number').max(15, 'Too long').optional().or(z.literal('')),
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  password,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((v) => v.password === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
