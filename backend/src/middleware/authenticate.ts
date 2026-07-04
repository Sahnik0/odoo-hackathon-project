import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../lib/apiError';
import { verifyAccessToken } from '../services/token.service';

// Verify the Bearer access token and attach the principal to req.user (Section 6).
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthenticated('Missing or malformed Authorization header');
  }
  const payload = verifyAccessToken(header.slice('Bearer '.length));
  req.user = { id: payload.sub, role: payload.role, email: payload.email };
  next();
}
