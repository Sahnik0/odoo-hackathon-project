import type { LeaveType, Prisma, PrismaClient, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { ApiError } from '../lib/apiError';
import { sanitizeText } from '../lib/sanitize';
import { resolveProfileId } from '../lib/profile';
import { orgDateOnly, inclusiveDayCount, eachDateInclusive } from '../lib/time';
import { buildOrderBy } from '../validators/common';
import { buildPageMeta } from '../lib/apiResponse';
import { notify, notifyAdmins } from './notification.service';
import type { ApplyLeaveInput, ListLeaveQuery, ReviewLeaveInput } from '../validators/leave.validators';

export interface Requester {
  id: string;
  role: Role;
}

type Tx = Prisma.TransactionClient | PrismaClient;

const profileInclude = {
  employeeProfile: {
    select: { id: true, firstName: true, lastName: true, department: true, loginId: true, userId: true },
  },
} as const;

const SORTABLE = ['createdAt', 'startDate', 'status'] as const;

const defaultAllocation = (type: LeaveType): number | null => {
  if (type === 'PAID') return env.LEAVE_DEFAULT_PAID;
  if (type === 'SICK') return env.LEAVE_DEFAULT_SICK;
  return null; // UNPAID — unlimited (Section 2)
};

/** Balance rows are seeded at profile-creation time for the join year only
 *  (Phase 1). There's no annual rollover cron (documented limitation, same
 *  spirit as no-cron-auto-absent) — auto-create the year's row on first access
 *  with the admin-configurable defaults instead of leaving it 404. */
async function getOrInitBalance(tx: Tx, employeeProfileId: string, type: LeaveType, year: number) {
  const existing = await tx.leaveBalance.findUnique({
    where: { employeeProfileId_type_year: { employeeProfileId, type, year } },
  });
  if (existing) return existing;
  return tx.leaveBalance.create({
    data: { employeeProfileId, type, year, allocated: defaultAllocation(type), used: 0 },
  });
}

async function loadOr404(id: string) {
  const leave = await prisma.leaveRequest.findFirst({
    where: { id, deletedAt: null },
    include: profileInclude,
  });
  if (!leave) throw ApiError.notFound('Leave request not found');
  return leave;
}

function assertCanAccess(requester: Requester, profileUserId: string) {
  if (requester.role !== 'ADMIN' && profileUserId !== requester.id) {
    throw ApiError.forbidden('You can only access your own leave requests');
  }
}

/** Apply for leave (own record). Rejects overlap against PENDING/APPROVED
 *  requests and (for PAID/SICK) insufficient remaining balance (Section 2). */
export async function apply(userId: string, input: ApplyLeaveInput) {
  const employeeProfileId = await resolveProfileId(userId);
  const days = inclusiveDayCount(input.startDate, input.endDate);

  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeProfileId,
      deletedAt: null,
      status: { in: ['PENDING', 'APPROVED'] },
      startDate: { lte: input.endDate },
      endDate: { gte: input.startDate },
    },
  });
  if (overlap) {
    throw ApiError.conflict('This date range overlaps an existing pending or approved leave request');
  }

  if (input.type !== 'UNPAID') {
    const year = input.startDate.getUTCFullYear();
    const balance = await getOrInitBalance(prisma, employeeProfileId, input.type, year);
    const remaining = balance.allocated === null ? Infinity : balance.allocated - balance.used;
    if (days > remaining) {
      throw ApiError.conflict(`Insufficient ${input.type} leave balance — ${remaining} day(s) remaining`);
    }
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeProfileId,
      type: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      reason: sanitizeText(input.reason),
    },
    include: profileInclude,
  });

  await notifyAdmins(
    'LEAVE_SUBMITTED',
    `${leave.employeeProfile.firstName} ${leave.employeeProfile.lastName} requested ${days} day(s) of ${input.type.toLowerCase()} leave`,
    `/admin/leave/${leave.id}`,
  );

  return leave;
}

export async function getById(id: string, requester: Requester) {
  const leave = await loadOr404(id);
  assertCanAccess(requester, leave.employeeProfile.userId);
  return leave;
}

export async function listMine(userId: string, query: ListLeaveQuery) {
  const employeeProfileId = await resolveProfileId(userId);
  const { page, pageSize, sort, status, type } = query;
  const where: Prisma.LeaveRequestWhereInput = {
    employeeProfileId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.leaveRequest.count({ where }),
    prisma.leaveRequest.findMany({
      where,
      orderBy: buildOrderBy(sort, SORTABLE),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

/** Admin list with filters (employee/status/type/date-range), paginated. */
export async function list(query: ListLeaveQuery) {
  const { page, pageSize, sort, employeeId, status, type, dateFrom, dateTo } = query;

  const dateFilter =
    dateFrom || dateTo
      ? {
          ...(dateFrom ? { endDate: { gte: orgDateOnly(dateFrom) } } : {}),
          ...(dateTo ? { startDate: { lte: orgDateOnly(dateTo) } } : {}),
        }
      : {};

  const where: Prisma.LeaveRequestWhereInput = {
    deletedAt: null,
    ...(employeeId ? { employeeProfileId: employeeId } : {}),
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...dateFilter,
  };

  const [total, data] = await Promise.all([
    prisma.leaveRequest.count({ where }),
    prisma.leaveRequest.findMany({
      where,
      include: profileInclude,
      orderBy: buildOrderBy(sort, SORTABLE),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

/** Admin approve/reject (Section 8). Approval deducts balance and syncs
 *  attendance LEAVE markers across the range; rejection just notifies. */
export async function review(id: string, input: ReviewLeaveInput, adminId: string) {
  const leave = await loadOr404(id);
  if (leave.status !== 'PENDING') {
    throw ApiError.conflict('This leave request has already been reviewed');
  }
  const remarks = input.remarks ? sanitizeText(input.remarks) : null;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.leaveRequest.update({
      where: { id },
      data: { status: input.status, reviewedById: adminId, reviewRemarks: remarks, reviewedAt: now },
    });

    if (input.status === 'APPROVED') {
      if (leave.type !== 'UNPAID') {
        const year = leave.startDate.getUTCFullYear();
        const balance = await getOrInitBalance(tx, leave.employeeProfileId, leave.type, year);
        await tx.leaveBalance.update({ where: { id: balance.id }, data: { used: balance.used + leave.days } });
      }
      // Mark LEAVE on days with no existing attendance row (never overwrite a
      // real check-in/absent record already on the books).
      for (const date of eachDateInclusive(leave.startDate, leave.endDate)) {
        await tx.attendance.upsert({
          where: { employeeProfileId_date: { employeeProfileId: leave.employeeProfileId, date } },
          create: { employeeProfileId: leave.employeeProfileId, date, status: 'LEAVE' },
          update: {},
        });
      }
    }
  });

  await notify(
    leave.employeeProfile.userId,
    input.status === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
    `Your ${leave.type.toLowerCase()} leave request (${leave.days} day(s)) was ${input.status.toLowerCase()}`,
    `/leave/${id}`,
  );

  return loadOr404(id);
}

/** Employee cancels their own request. Allowed while PENDING at any time, or
 *  APPROVED provided it hasn't started yet — the only case a balance restore
 *  is meaningful (Section 2's "restore on ... cancel of a still-pending
 *  request" is a no-op for PENDING since nothing was deducted yet; extending
 *  cancel to not-yet-started APPROVED leave is where restore actually applies —
 *  logged as a judgment call in CONTEXT.md). Admin may cancel any employee's. */
export async function cancel(id: string, requester: Requester) {
  const leave = await loadOr404(id);
  assertCanAccess(requester, leave.employeeProfile.userId);

  const today = orgDateOnly();
  const cancellable = leave.status === 'PENDING' || (leave.status === 'APPROVED' && leave.startDate > today);
  if (!cancellable) {
    throw ApiError.conflict('This leave request can no longer be cancelled');
  }

  await prisma.$transaction(async (tx) => {
    await tx.leaveRequest.update({ where: { id }, data: { status: 'CANCELLED' } });

    if (leave.status === 'APPROVED') {
      if (leave.type !== 'UNPAID') {
        const year = leave.startDate.getUTCFullYear();
        const balance = await getOrInitBalance(tx, leave.employeeProfileId, leave.type, year);
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { used: Math.max(0, balance.used - leave.days) },
        });
      }
      // Undo LEAVE markers this approval added (only pure LEAVE rows — never
      // touch a day that also has a real check-in).
      await tx.attendance.deleteMany({
        where: {
          employeeProfileId: leave.employeeProfileId,
          date: { gte: leave.startDate, lte: leave.endDate },
          status: 'LEAVE',
          checkIn: null,
        },
      });
    }
  });

  return loadOr404(id);
}

/** Own (or admin-viewed) leave balances for a calendar year, all 3 types,
 *  auto-initialized on first access (see getOrInitBalance). */
export async function getBalance(employeeProfileId: string, year: number) {
  const types: LeaveType[] = ['PAID', 'SICK', 'UNPAID'];
  const balances = await Promise.all(types.map((t) => getOrInitBalance(prisma, employeeProfileId, t, year)));
  return balances.map((b) => ({
    type: b.type,
    year: b.year,
    allocated: b.allocated,
    used: b.used,
    remaining: b.allocated === null ? null : b.allocated - b.used,
  }));
}
