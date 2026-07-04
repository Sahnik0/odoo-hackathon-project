import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { generateOpaqueToken, hashToken } from '../lib/crypto';
import { ApiError } from '../lib/apiError';

export interface AccessPayload {
  sub: string; // user id
  role: Role;
  email: string;
}

export interface RefreshContext {
  userAgent?: string;
  ip?: string;
}

// ---- Access token (JWT, 15m) ----

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
  } catch {
    throw ApiError.unauthenticated('Invalid or expired access token');
  }
}

// ---- Refresh token (opaque, hashed at rest, rotating) ----

function refreshTtlMs(rememberMe: boolean): number {
  const days = rememberMe ? env.REFRESH_TOKEN_TTL_DAYS_REMEMBER : env.REFRESH_TOKEN_TTL_DAYS;
  return days * 24 * 60 * 60 * 1000;
}

/** Issue a brand-new refresh token (new family). Returns the RAW token for the cookie. */
export async function issueRefreshToken(
  userId: string,
  rememberMe: boolean,
  ctx: RefreshContext = {},
): Promise<{ raw: string; expiresAt: Date }> {
  const raw = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + refreshTtlMs(rememberMe));
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      familyId: randomUUID(),
      rememberMe,
      expiresAt,
      userAgent: ctx.userAgent,
      ip: ctx.ip,
    },
  });
  return { raw, expiresAt };
}

/**
 * Rotate a refresh token: validate the presented raw token, issue a replacement in
 * the same family, and invalidate the old one. Reuse of an already-rotated token is
 * treated as theft → the entire family is revoked (Section 2).
 */
export async function rotateRefreshToken(
  raw: string,
  ctx: RefreshContext = {},
): Promise<{ userId: string; role: Role; email: string; raw: string; expiresAt: Date }> {
  const tokenHash = hashToken(raw);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!existing) {
    throw ApiError.unauthenticated('Invalid refresh token');
  }

  // Reuse of a rotated/revoked token → theft. Nuke the family.
  if (existing.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { familyId: existing.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw ApiError.unauthenticated('Refresh token reuse detected; session revoked');
  }

  if (existing.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthenticated('Refresh token expired');
  }

  if (existing.user.deletedAt) {
    throw ApiError.unauthenticated('Account is no longer active');
  }

  const newRaw = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + refreshTtlMs(existing.rememberMe));
  const newHash = hashToken(newRaw);

  // Rotate atomically: mark old revoked+replaced, create the new token in the family.
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), replacedByTokenHash: newHash },
    }),
    prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        tokenHash: newHash,
        familyId: existing.familyId,
        rememberMe: existing.rememberMe,
        expiresAt,
        userAgent: ctx.userAgent,
        ip: ctx.ip,
      },
    }),
  ]);

  return {
    userId: existing.userId,
    role: existing.user.role,
    email: existing.user.email,
    raw: newRaw,
    expiresAt,
  };
}

/** Revoke a single refresh token (logout). Silent if unknown/already revoked. */
export async function revokeRefreshToken(raw: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(raw), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Revoke every active refresh token for a user (password reset — Section 2). */
export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
