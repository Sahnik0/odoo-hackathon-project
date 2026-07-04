import { z } from 'zod';

// Shared list-query params (Section 2: applies to every list endpoint).
// Coerced from query strings. Resource schemas extend this with their own filters.
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().trim().optional(), // e.g. "-createdAt" (desc) or "firstName" (asc)
  search: z.string().trim().max(200).optional(),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

// Translate a `sort` string against an allowlist → Prisma orderBy. Unknown fields
// fall back to the default so a client can't sort by arbitrary columns.
export function buildOrderBy<T extends string>(
  sort: string | undefined,
  allowed: readonly T[],
  fallback: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' },
): Record<string, 'asc' | 'desc'> {
  if (!sort) return fallback;
  const dir = sort.startsWith('-') ? 'desc' : 'asc';
  const field = sort.replace(/^-/, '');
  if (!(allowed as readonly string[]).includes(field)) return fallback;
  return { [field]: dir };
}
