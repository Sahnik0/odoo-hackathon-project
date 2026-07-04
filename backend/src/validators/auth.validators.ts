import { z } from 'zod';

// Mirror these field-for-field in the frontend Zod schemas (Section 4 / 9).
// Unknown keys are stripped by default (Section 6 field sanitization).

const email = z.string().trim().toLowerCase().email('Invalid email format');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

const name = z.string().trim().min(1, 'Required').max(50, 'Too long');

export const registerSchema = z.object({
  email,
  password,
  firstName: name,
  lastName: name,
  companyName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export const loginSchema = z.object({
  // Accepts email address OR Login ID (e.g. OIJODO20250001)
  email: z.string().trim().min(1, 'Login ID or email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const resendVerificationSchema = z.object({ email });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password,
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
