import { api } from '@/lib/axios';
import type { ApiSuccess } from '@/types/api';
import type { AuthUser } from '@/types/auth';

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function registerRequest(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
}) {
  const res = await api.post<ApiSuccess<{ id: string; email: string; message: string }>>(
    '/auth/register',
    input,
  );
  return res.data.data;
}

export async function verifyEmailRequest(token: string) {
  const res = await api.post<ApiSuccess<{ verified: boolean; loginId: string; message: string }>>('/auth/verify-email', {
    token,
  });
  return res.data.data;
}

export async function resendVerificationRequest(email: string) {
  const res = await api.post<ApiSuccess<{ message: string }>>('/auth/resend-verification', { email });
  return res.data.data;
}

export async function loginRequest(input: { email: string; password: string; rememberMe?: boolean }) {
  const res = await api.post<ApiSuccess<LoginResponse>>('/auth/login', input);
  return res.data.data;
}

export async function logoutRequest() {
  await api.post('/auth/logout');
}

/** POST /auth/refresh also returns {accessToken,user} in one shot — used once
 *  on app mount to silently restore a session from the httpOnly refresh
 *  cookie (the access token itself never survives a hard reload; it's
 *  memory-only per Section 2). */
export async function refreshSessionRequest() {
  const res = await api.post<ApiSuccess<LoginResponse>>('/auth/refresh');
  return res.data.data;
}

export async function forgotPasswordRequest(email: string) {
  const res = await api.post<ApiSuccess<{ message: string }>>('/auth/forgot-password', { email });
  return res.data.data;
}

export async function resetPasswordRequest(token: string, password: string) {
  const res = await api.post<ApiSuccess<{ message: string }>>('/auth/reset-password', { token, password });
  return res.data.data;
}

export async function setRoleRequest(role: 'EMPLOYEE' | 'ADMIN') {
  const res = await api.post<ApiSuccess<LoginResponse>>('/auth/set-role', { role });
  return res.data.data;
}
