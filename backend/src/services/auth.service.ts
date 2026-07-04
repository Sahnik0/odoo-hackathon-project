import type { LeaveType } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/apiError';
import { hashPassword, verifyPassword } from '../lib/password';
import { generateOpaqueToken, hashToken } from '../lib/crypto';
import { nextLoginId } from '../lib/loginId';
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  type RefreshContext,
} from './token.service';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function leaveAllocation(): { type: LeaveType; allocated: number | null }[] {
  return [
    { type: 'PAID', allocated: env.LEAVE_DEFAULT_PAID },
    { type: 'SICK', allocated: env.LEAVE_DEFAULT_SICK },
    { type: 'UNPAID', allocated: null }, // unlimited
  ];
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/** Self-registration → always EMPLOYEE (Section 2). Creates user+profile+login ID
 *  +leave balances, then emails a verification link. */
export async function register(input: RegisterInput): Promise<{ id: string; email: string }> {
  const email = normalizeEmail(input.email);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const joinYear = now.getUTCFullYear();
  const rawVerifyToken = generateOpaqueToken();
  const verifyExpires = new Date(now.getTime() + env.EMAIL_VERIFY_TTL_HOURS * 3600 * 1000);

  const user = await prisma.$transaction(async (tx) => {
    const loginId = await nextLoginId(tx, input.firstName, input.lastName, joinYear);
    return tx.user.create({
      data: {
        email,
        passwordHash,
        role: 'EMPLOYEE',
        emailVerifyTokenHash: hashToken(rawVerifyToken),
        emailVerifyTokenExpires: verifyExpires,
        emailVerifyLastSentAt: now,
        profile: {
          create: {
            loginId,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            dateOfJoining: now,
            leaveBalances: {
              createMany: {
                data: leaveAllocation().map((a) => ({
                  type: a.type,
                  year: joinYear,
                  allocated: a.allocated,
                })),
              },
            },
          },
        },
      },
    });
  });

  await sendVerificationEmail(email, rawVerifyToken);
  return { id: user.id, email: user.email };
}

/** Verify email via token (24h, single-use). Fires EMAIL_VERIFIED notification. */
export async function verifyEmail(rawToken: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { emailVerifyTokenHash: hashToken(rawToken) },
  });
  if (
    !user ||
    !user.emailVerifyTokenExpires ||
    user.emailVerifyTokenExpires.getTime() < Date.now()
  ) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyTokenHash: null,
        emailVerifyTokenExpires: null,
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'EMAIL_VERIFIED',
        message: 'Your email has been verified. Welcome to HRMS!',
        link: '/dashboard',
      },
    }),
  ]);
}

/** Resend verification email with a 60s cooldown (Section 2). Generic on unknown /
 *  already-verified accounts to limit enumeration. */
export async function resendVerification(emailRaw: string): Promise<void> {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified || user.deletedAt) return; // generic success

  const cooldownMs = env.EMAIL_RESEND_COOLDOWN_SECONDS * 1000;
  if (user.emailVerifyLastSentAt && Date.now() - user.emailVerifyLastSentAt.getTime() < cooldownMs) {
    throw new ApiError('RATE_LIMITED', 'Please wait before requesting another email');
  }

  const rawToken = generateOpaqueToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyTokenHash: hashToken(rawToken),
      emailVerifyTokenExpires: new Date(Date.now() + env.EMAIL_VERIFY_TTL_HOURS * 3600 * 1000),
      emailVerifyLastSentAt: new Date(),
    },
  });
  await sendVerificationEmail(email, rawToken);
}

export interface LoginResult {
  accessToken: string;
  refresh: { raw: string; expiresAt: Date };
  user: { id: string; email: string; role: 'EMPLOYEE' | 'ADMIN' };
}

/** Login — blocked until email verified (Section 8). Generic credential errors. */
export async function login(
  emailRaw: string,
  password: string,
  rememberMe: boolean,
  ctx: RefreshContext = {},
): Promise<LoginResult> {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw ApiError.unauthenticated('Invalid email or password');
  }
  if (!user.emailVerified) {
    throw ApiError.forbidden('Please verify your email before logging in');
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refresh = await issueRefreshToken(user.id, rememberMe, ctx);
  return { accessToken, refresh, user: { id: user.id, email: user.email, role: user.role } };
}

/** Rotate the refresh token and mint a fresh access token. */
export async function refresh(
  rawRefresh: string,
  ctx: RefreshContext = {},
): Promise<LoginResult> {
  const rotated = await rotateRefreshToken(rawRefresh, ctx);
  const accessToken = signAccessToken({
    sub: rotated.userId,
    role: rotated.role,
    email: rotated.email,
  });
  return {
    accessToken,
    refresh: { raw: rotated.raw, expiresAt: rotated.expiresAt },
    user: { id: rotated.userId, email: rotated.email, role: rotated.role },
  };
}

/** Logout — revoke the presented refresh token. */
export async function logout(rawRefresh: string | undefined): Promise<void> {
  if (rawRefresh) await revokeRefreshToken(rawRefresh);
}

/** Forgot password — always generic response (no enumeration). Emails a 1h token. */
export async function forgotPassword(emailRaw: string): Promise<void> {
  const email = normalizeEmail(emailRaw);
  const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
  if (!user) return; // generic success

  const rawToken = generateOpaqueToken();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: hashToken(rawToken),
      passwordResetTokenExpires: new Date(Date.now() + env.PASSWORD_RESET_TTL_HOURS * 3600 * 1000),
    },
  });
  await sendPasswordResetEmail(email, rawToken);
}

/** Reset password (1h token, single-use). Invalidates all refresh tokens (Section 2). */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: hashToken(rawToken) },
  });
  if (
    !user ||
    !user.passwordResetTokenExpires ||
    user.passwordResetTokenExpires.getTime() < Date.now()
  ) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetTokenExpires: null,
    },
  });
  await revokeAllRefreshTokens(user.id);
}
