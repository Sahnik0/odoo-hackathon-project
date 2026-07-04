import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// Single Prisma client for the app. Reused across services/tests.
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
