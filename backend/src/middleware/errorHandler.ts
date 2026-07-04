import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { ApiError } from '../lib/apiError';
import { logger } from '../lib/logger';

// 404 for unmatched routes — funnels into the error handler below.
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(ApiError.notFound('Route not found'));
};

// The ONLY place error responses are formatted (Section 7). Controllers throw
// typed ApiError (or Zod throws) — this maps them to the error envelope.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Multer rejects oversized files itself (before our own size check ever
  // runs) — surface that as 422, matching Section 2's upload-constraint
  // contract, instead of letting it fall through to 500.
  if (err instanceof MulterError) {
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields: { file: err.message } },
    });
  }

  // Zod validation errors → 422 with field map.
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      fields[issue.path.join('.') || '_'] = issue.message;
    }
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields },
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  // Unknown → 500, do not leak internals.
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
};
