import type { Role } from '@prisma/client';

// Attach the authenticated principal to the request (set by authenticate middleware).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; email: string };
    }
  }
}

export {};
