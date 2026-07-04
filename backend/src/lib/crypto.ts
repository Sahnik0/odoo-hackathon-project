import { randomBytes, createHash } from 'crypto';

// Opaque tokens (refresh, email-verify, password-reset). NOT JWTs (Section 2).
// The raw token is returned to the client/emailed; only its sha256 hash is stored,
// so a DB leak never exposes usable tokens.

export const generateOpaqueToken = (): string => randomBytes(32).toString('hex'); // 256-bit

export const hashToken = (raw: string): string =>
  createHash('sha256').update(raw).digest('hex');
