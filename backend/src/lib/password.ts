import bcrypt from 'bcrypt';
import { env } from '../config/env';

// bcrypt hashing at the configured cost (Section 3: cost 12).
export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_COST);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
