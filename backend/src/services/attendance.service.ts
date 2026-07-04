import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { ApiError } from '../lib/apiError';
import { orgDateOnly, viewRange, type AttendanceView } from '../lib/time';
import { resolveProfileId } from '../lib/profile';
import { buildOrderBy } from '../validators/common';
import { buildPageMeta } from '../lib/apiResponse';
import { sanitizeText } from '../lib/sanitize';
import type { ListAttendanceQuery, MarkAbsentInput } from '../validators/attendance.validators';

const profileInclude = {
  employeeProfile: {
    select: { id: true, firstName: true, lastName: true, department: true, loginId: true },
  },
} as const;

const myProfileId = resolveProfileId;

const dayKey = (employeeProfileId: string, date: Date) => ({
  employeeProfileId_date: { employeeProfileId, date },
});

/** Check in for today (org-local day). One row per day; double check-in → 409.
 *  An admin-marked ABSENT/LEAVE row can still be checked into (overrides to PRESENT). */
export async function checkIn(userId: string) {
  const employeeProfileId = await myProfileId(userId);
  const date = orgDateOnly();

  const existing = await prisma.attendance.findUnique({ where: dayKey(employeeProfileId, date) });
  if (existing?.checkIn) throw ApiError.conflict('Already checked in today');

  const now = new Date();
  return prisma.attendance.upsert({
    where: dayKey(employeeProfileId, date),
    create: { employeeProfileId, date, checkIn: now, status: 'PRESENT' },
    update: { checkIn: now, checkOut: null, workedMinutes: null, status: 'PRESENT' },
  });
}

/** Check out for today. No matching check-in → 409. Computes workedMinutes; below
 *  the half-day threshold (default 4h) → HALF_DAY, else PRESENT (Section 2). */
export async function checkOut(userId: string) {
  const employeeProfileId = await myProfileId(userId);
  const date = orgDateOnly();

  const row = await prisma.attendance.findUnique({ where: dayKey(employeeProfileId, date) });
  if (!row || !row.checkIn) throw ApiError.conflict('No check-in found for today');
  if (row.checkOut) throw ApiError.conflict('Already checked out today');

  const now = new Date();
  const workedMinutes = Math.round((now.getTime() - row.checkIn.getTime()) / 60_000);
  const status = workedMinutes < env.HALF_DAY_THRESHOLD_HOURS * 60 ? 'HALF_DAY' : 'PRESENT';

  return prisma.attendance.update({
    where: { id: row.id },
    data: { checkOut: now, workedMinutes, status },
  });
}

/** Own attendance for a view granularity (daily/weekly/monthly). */
export async function myAttendance(userId: string, view: AttendanceView) {
  const employeeProfileId = await myProfileId(userId);
  const { gte, lte } = viewRange(view);
  const data = await prisma.attendance.findMany({
    where: { employeeProfileId, date: { gte, lte } },
    orderBy: { date: 'desc' },
  });
  return { data, view, range: { from: gte, to: lte } };
}

/** Admin list with filters (dept/date-range/employee/status), paginated. */
export async function list(query: ListAttendanceQuery) {
  const { page, pageSize, sort, employeeId, department, status, dateFrom, dateTo } = query;

  const dateFilter =
    dateFrom || dateTo
      ? { date: { ...(dateFrom ? { gte: orgDateOnly(dateFrom) } : {}), ...(dateTo ? { lte: orgDateOnly(dateTo) } : {}) } }
      : {};

  const where: Prisma.AttendanceWhereInput = {
    ...(employeeId ? { employeeProfileId: employeeId } : {}),
    ...(status ? { status } : {}),
    ...dateFilter,
    employeeProfile: { deletedAt: null, ...(department ? { department } : {}) },
  };

  const [total, data] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where,
      include: profileInclude,
      orderBy: buildOrderBy(sort, ['date', 'createdAt'], { date: 'desc' }),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

/** Admin manual absence (no cron auto-absent — Section 2). Upserts an ABSENT row. */
export async function markAbsent(input: MarkAbsentInput) {
  const profile = await prisma.employeeProfile.findFirst({
    where: { id: input.employeeId, deletedAt: null },
    select: { id: true },
  });
  if (!profile) throw ApiError.notFound('Employee not found');

  const date = orgDateOnly(input.date);
  const note = input.note ? sanitizeText(input.note) : null;

  return prisma.attendance.upsert({
    where: dayKey(profile.id, date),
    create: { employeeProfileId: profile.id, date, status: 'ABSENT', note },
    update: { status: 'ABSENT', checkIn: null, checkOut: null, workedMinutes: null, note },
  });
}
