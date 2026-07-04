import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';

// Assembles the Express app (no listen — see server.ts). Kept separate so
// Supertest can import the app without binding a port.
export function createApp(): Express {
  const app = express();

  // Security headers + explicit CSP (Section 6). API serves JSON, not HTML —
  // lock the default-src down; docs UI relaxes this on its own route in Phase 11.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
    }),
  );

  // CORS locked to the configured frontend origin, credentials on for cookies.
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(pinoHttp({ logger }));

  // Routes (grow per phase).
  app.use('/', healthRoutes);

  // 404 + centralized error formatting (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
