// Typed errors thrown by controllers/services. The centralized error handler
// (middleware/errorHandler.ts) is the ONLY place these are turned into responses
// (Section 7). Controllers never format error bodies directly.

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(code: ErrorCode, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.fields = fields;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message = 'Malformed request', fields?: Record<string, string>) {
    return new ApiError('BAD_REQUEST', message, fields);
  }
  static unauthenticated(message = 'Authentication required') {
    return new ApiError('UNAUTHENTICATED', message);
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError('FORBIDDEN', message);
  }
  static notFound(message = 'Resource not found') {
    return new ApiError('NOT_FOUND', message);
  }
  static conflict(message = 'Resource conflict') {
    return new ApiError('CONFLICT', message);
  }
  static validation(message = 'Validation failed', fields?: Record<string, string>) {
    return new ApiError('VALIDATION_ERROR', message, fields);
  }
}
