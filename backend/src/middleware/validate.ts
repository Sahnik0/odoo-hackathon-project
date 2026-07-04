import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

type Source = 'body' | 'query' | 'params';

// Validate + coerce a request part against a Zod schema. Unknown keys are stripped
// (Zod default) — this is the "strip unexpected fields" sanitization (Section 6).
// On failure the ZodError propagates to the centralized error handler → 422.
export const validate =
  (schema: ZodTypeAny, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    req[source] = result.data;
    next();
  };
