import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/apiError';
import { resolveProfileId } from '../lib/profile';
import { buildPageMeta } from '../lib/apiResponse';
import { notify } from './notification.service';
import type {
  GeneratePayrollInput,
  ListPayrollQuery,
  UpsertSalaryStructureInput,
} from '../validators/payroll.validators';

export interface Requester {
  id: string;
  role: Role;
}

const profileInclude = {
  employeeProfile: {
    select: { id: true, firstName: true, lastName: true, department: true, loginId: true, userId: true },
  },
} as const;

const toPaise = (rupees: number) => Math.round(rupees * 100);

async function loadProfileOr404(employeeProfileId: string) {
  const profile = await prisma.employeeProfile.findFirst({
    where: { id: employeeProfileId, deletedAt: null },
    select: { id: true, userId: true },
  });
  if (!profile) throw ApiError.notFound('Employee not found');
  return profile;
}

function assertCanAccess(requester: Requester, profileUserId: string) {
  if (requester.role !== 'ADMIN' && profileUserId !== requester.id) {
    throw ApiError.forbidden('You can only access your own payroll records');
  }
}

/** Employee read-only; Admin edits (Section 8) — ownership enforced here, not
 *  just by route, so `GET /payroll/salary/:employeeId` is safe either way. */
export async function getSalaryStructure(employeeId: string, requester: Requester) {
  const profile = await loadProfileOr404(employeeId);
  assertCanAccess(requester, profile.userId);
  const structure = await prisma.salaryStructure.findUnique({ where: { employeeProfileId: employeeId } });
  if (!structure) throw ApiError.notFound('No salary structure defined for this employee yet');
  return structure;
}

/** Admin-only (route-level authorize) upsert — one salary structure per
 *  employee (Prisma one-to-one via the unique FK). */
export async function upsertSalaryStructure(employeeId: string, input: UpsertSalaryStructureInput) {
  await loadProfileOr404(employeeId);
  const data = {
    basic: toPaise(input.basic),
    hra: toPaise(input.hra),
    allowances: toPaise(input.allowances),
    deductions: toPaise(input.deductions),
    ...(input.effectiveFrom ? { effectiveFrom: input.effectiveFrom } : {}),
  };
  return prisma.salaryStructure.upsert({
    where: { employeeProfileId: employeeId },
    create: { employeeProfileId: employeeId, ...data },
    update: data,
  });
}

/** Distinct explicit action (Section 8) — POST /payroll/generate, upsert
 *  semantics: re-generating an existing month/year snapshot refreshes it from
 *  the current salary structure rather than erroring (documented in
 *  CONTEXT.md — the endpoint-shape decision Phase 6 flagged). */
export async function generate(input: GeneratePayrollInput, adminId: string) {
  const profile = await loadProfileOr404(input.employeeId);
  const structure = await prisma.salaryStructure.findUnique({
    where: { employeeProfileId: input.employeeId },
  });
  if (!structure) {
    throw ApiError.conflict('No salary structure defined for this employee — set one before generating payroll');
  }

  const gross = structure.basic + structure.hra + structure.allowances;
  const net = gross - structure.deductions;

  const payroll = await prisma.payroll.upsert({
    where: {
      employeeProfileId_month_year: {
        employeeProfileId: input.employeeId,
        month: input.month,
        year: input.year,
      },
    },
    create: {
      employeeProfileId: input.employeeId,
      month: input.month,
      year: input.year,
      basic: structure.basic,
      hra: structure.hra,
      allowances: structure.allowances,
      deductions: structure.deductions,
      gross,
      net,
      currency: structure.currency,
      generatedById: adminId,
    },
    update: {
      basic: structure.basic,
      hra: structure.hra,
      allowances: structure.allowances,
      deductions: structure.deductions,
      gross,
      net,
      currency: structure.currency,
      generatedById: adminId,
      generatedAt: new Date(),
    },
    include: profileInclude,
  });

  await notify(
    profile.userId,
    'PAYROLL_GENERATED',
    `Your payroll for ${input.month}/${input.year} has been generated`,
    `/payroll/${payroll.id}`,
  );

  return payroll;
}

export async function listMine(userId: string, query: ListPayrollQuery) {
  const employeeProfileId = await resolveProfileId(userId);
  const { page, pageSize, month, year } = query;
  const where: Prisma.PayrollWhereInput = {
    employeeProfileId,
    ...(month ? { month } : {}),
    ...(year ? { year } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.payroll.count({ where }),
    prisma.payroll.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

export async function list(query: ListPayrollQuery) {
  const { page, pageSize, employeeId, month, year } = query;
  const where: Prisma.PayrollWhereInput = {
    ...(employeeId ? { employeeProfileId: employeeId } : {}),
    ...(month ? { month } : {}),
    ...(year ? { year } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.payroll.count({ where }),
    prisma.payroll.findMany({
      where,
      include: profileInclude,
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

export async function getById(id: string, requester: Requester) {
  const payroll = await prisma.payroll.findUnique({ where: { id }, include: profileInclude });
  if (!payroll) throw ApiError.notFound('Payroll record not found');
  assertCanAccess(requester, payroll.employeeProfile.userId);
  return payroll;
}
