import rateLimit, { type Options } from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { ApiError } from '../lib/apiError';

// Rate limits per Section 2. Limiters funnel breaches through our error envelope
// (429). Disabled under NODE_ENV=test so integration suites aren't throttled.
const onLimit = (_req: Request, _res: Response, next: NextFunction) =>
  next(new ApiError('RATE_LIMITED', 'Too many requests, please try again later'));

const base: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: onLimit,
  skip: () => env.NODE_ENV === 'test',
};

export const loginLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 5 });
export const registerLimiter = rateLimit({ ...base, windowMs: 60_000, limit: 3 });
export const forgotPasswordLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 3 });

// Per-user limit for all other authenticated routes (100/min). Keyed by user id
// when authenticated, else IP.
export const authenticatedLimiter = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 100,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
});
