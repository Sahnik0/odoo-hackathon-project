import { prisma } from './prisma';
import { ApiError } from './apiError';

// Resolve the calling user's EmployeeProfile id. Shared by attendance, leave,
// and payroll services (each needs "my own record" scoping) — see TASK.md Phase 4.
export async function resolveProfileId(userId: string): Promise<string> {
  const profile = await prisma.employeeProfile.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true },
  });
  if (!profile) throw ApiError.notFound('Employee profile not found');
  return profile.id;
}
