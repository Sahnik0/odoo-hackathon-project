import { Prisma, type Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/apiError';
import { buildOrderBy } from '../validators/common';
import { sanitizeText } from '../lib/sanitize';
import { hashPassword } from '../lib/password';
import { generateOpaqueToken, hashToken } from '../lib/crypto';
import { nextLoginId } from '../lib/loginId';
import { env } from '../config/env';
import { sendPasswordResetEmail } from './email.service';
import {
  ADMIN_ONLY_FIELDS,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type ListEmployeesQuery,
} from '../validators/employee.validators';
import { buildPageMeta } from '../lib/apiResponse';

export interface Requester {
  id: string;
  role: Role;
}

const profileInclude = {
  user: { select: { id: true, email: true, role: true, emailVerified: true } },
} as const;

const SORTABLE = ['createdAt', 'firstName', 'lastName', 'department', 'dateOfJoining'] as const;

async function loadProfileOr404(id: string) {
  const profile = await prisma.employeeProfile.findFirst({
    where: { id, deletedAt: null },
    include: profileInclude,
  });
  if (!profile) throw ApiError.notFound('Employee not found');
  return profile;
}

/** Ownership + role gate: Admin sees anyone, Employee only themselves (Section 6). */
function assertCanAccess(requester: Requester, profileUserId: string) {
  if (requester.role !== 'ADMIN' && profileUserId !== requester.id) {
    throw ApiError.forbidden('You can only access your own profile');
  }
}

export async function getById(id: string, requester: Requester) {
  const profile = await loadProfileOr404(id);
  assertCanAccess(requester, profile.userId);
  return profile;
}

export async function getMine(userId: string) {
  const profile = await prisma.employeeProfile.findFirst({
    where: { userId, deletedAt: null },
    include: profileInclude,
  });
  if (!profile) throw ApiError.notFound('Profile not found');
  return profile;
}

export async function list(query: ListEmployeesQuery) {
  const { page, pageSize, sort, search, department, status } = query;

  const where = {
    deletedAt: null,
    ...(department ? { department } : {}),
    ...(status ? { employmentStatus: status } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { loginId: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [total, data] = await Promise.all([
    prisma.employeeProfile.count({ where }),
    prisma.employeeProfile.findMany({
      where,
      include: profileInclude,
      orderBy: buildOrderBy(sort, SORTABLE),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

/** Admin-provisioned employee. Account is pre-verified (admin vouches for the
 *  address); a reset link is emailed so the employee sets their own password. */
export async function create(input: CreateEmployeeInput, _adminId: string) {
  const email = input.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const now = new Date();
  const joinDate = input.dateOfJoining ?? now;
  const joinYear = joinDate.getUTCFullYear();
  const tempPasswordHash = await hashPassword(generateOpaqueToken()); // unusable placeholder
  const rawResetToken = generateOpaqueToken();

  const profileId = await prisma.$transaction(async (tx) => {
    const loginId = await nextLoginId(tx, input.firstName, input.lastName, joinYear);
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: tempPasswordHash,
        role: 'EMPLOYEE',
        emailVerified: true,
        emailVerifiedAt: now,
        passwordResetTokenHash: hashToken(rawResetToken),
        passwordResetTokenExpires: new Date(now.getTime() + env.PASSWORD_RESET_TTL_HOURS * 3600 * 1000),
        profile: {
          create: {
            loginId,
            firstName: input.firstName.trim(),
            lastName: input.lastName.trim(),
            phone: input.phone ? sanitizeText(input.phone) : null,
            address: input.address ? sanitizeText(input.address) : null,
            department: input.department?.trim() ?? null,
            designation: input.designation?.trim() ?? null,
            dateOfJoining: joinDate,
            leaveBalances: {
              createMany: {
                data: [
                  { type: 'PAID', year: joinYear, allocated: env.LEAVE_DEFAULT_PAID },
                  { type: 'SICK', year: joinYear, allocated: env.LEAVE_DEFAULT_SICK },
                  { type: 'UNPAID', year: joinYear, allocated: null },
                ],
              },
            },
          },
        },
      },
      include: { profile: true },
    });
    return user.profile!.id;
  });

  // Admin-provisioned accounts get a "set your password" link (reuses reset flow).
  await sendPasswordResetEmail(email, rawResetToken);

  return loadProfileOr404(profileId);
}

/** Field-level RBAC (Section 8): Employee may edit only phone/address/profilePicture
 *  on their own record; any Admin-only field in the request → 403. Admin edits all. */
export async function update(id: string, input: UpdateEmployeeInput, requester: Requester) {
  const profile = await loadProfileOr404(id);
  assertCanAccess(requester, profile.userId);

  if (requester.role !== 'ADMIN') {
    const attemptedAdminFields = Object.keys(input).filter((k) =>
      (ADMIN_ONLY_FIELDS as readonly string[]).includes(k),
    );
    if (attemptedAdminFields.length > 0) {
      throw ApiError.forbidden(
        `You may only edit: phone, address, profilePicture. Blocked: ${attemptedAdminFields.join(', ')}`,
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (input.phone !== undefined) data.phone = sanitizeText(input.phone);
  if (input.address !== undefined) data.address = sanitizeText(input.address);
  if (input.profilePicture !== undefined) data.profilePicture = input.profilePicture.trim();
  if (requester.role === 'ADMIN') {
    if (input.firstName !== undefined) data.firstName = input.firstName.trim();
    if (input.lastName !== undefined) data.lastName = input.lastName.trim();
    if (input.department !== undefined) data.department = input.department.trim();
    if (input.designation !== undefined) data.designation = input.designation.trim();
    if (input.dateOfJoining !== undefined) data.dateOfJoining = input.dateOfJoining;
    if (input.employmentStatus !== undefined) data.employmentStatus = input.employmentStatus;
  }

  await prisma.employeeProfile.update({
    where: { id },
    data: data as Prisma.EmployeeProfileUpdateInput,
  });
  return loadProfileOr404(id);
}

/** Soft delete (Section 5): never hard-delete employee-linked records. Also
 *  soft-deletes the User so the account can no longer authenticate. */
export async function softDelete(id: string) {
  const profile = await loadProfileOr404(id);
  const now = new Date();
  await prisma.$transaction([
    prisma.employeeProfile.update({ where: { id }, data: { deletedAt: now } }),
    prisma.user.update({ where: { id: profile.userId }, data: { deletedAt: now } }),
    prisma.refreshToken.updateMany({
      where: { userId: profile.userId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);
}
