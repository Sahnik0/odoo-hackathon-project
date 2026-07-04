import type { Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../lib/apiError';
import { ok, created, noContent } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import type { RefreshContext } from '../services/token.service';
import * as authService from '../services/auth.service';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_PATH = '/auth'; // refresh cookie only travels to /auth/* routes

function setRefreshCookie(res: Response, raw: string, expiresAt: Date): void {
  res.cookie(REFRESH_COOKIE, raw, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // http on localhost in dev; https in prod
    sameSite: 'strict',
    path: COOKIE_PATH,
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
}

function refreshContext(req: Request): RefreshContext {
  return { userAgent: req.headers['user-agent'], ip: req.ip };
}

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, {
    ...result,
    message: 'Registration successful. Check your email to verify your account.',
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const result = await authService.verifyEmail(req.body.token);
  ok(res, { verified: true, loginId: result.loginId, email: result.email, message: 'Email verified. You can now log in with your Login ID.' });
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerification(req.body.email);
  ok(res, { message: 'If an unverified account exists, a verification email has been sent.' });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const result = await authService.login(email, password, rememberMe, refreshContext(req));
  setRefreshCookie(res, result.refresh.raw, result.refresh.expiresAt);
  ok(res, { accessToken: result.accessToken, user: result.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) throw ApiError.unauthenticated('No refresh token provided');
  const result = await authService.refresh(raw, refreshContext(req));
  setRefreshCookie(res, result.refresh.raw, result.refresh.expiresAt);
  ok(res, { accessToken: result.accessToken, user: result.user });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  noContent(res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  ok(res, { message: 'If an account exists for this email, a reset link has been sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ok(res, { message: 'Password reset successful. Please log in with your new password.' });
});

export const setRole = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { role } = req.body as { role: 'EMPLOYEE' | 'ADMIN' };
  if (role !== 'EMPLOYEE' && role !== 'ADMIN') {
    throw ApiError.badRequest('Invalid role. Must be EMPLOYEE or ADMIN.');
  }
  const result = await authService.setRoleAndReissueTokens(userId, role, refreshContext(req));
  setRefreshCookie(res, result.refresh.raw, result.refresh.expiresAt);
  ok(res, {
    accessToken: result.accessToken,
    user: result.user,
    message: 'Role updated successfully.',
  });
});
